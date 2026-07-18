import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BindingRate } from '../../entities/binding-rate.entity';
import { CoverRate } from '../../entities/cover-rate.entity';
import { PageRate } from '../../entities/page-rate.entity';
import { PriceBreakdown, Quote } from '../../entities/quote.entity';
import { User } from '../../entities/user.entity';
import { CalculateQuoteDto } from './dto/calculate-quote.dto';

/**
 * Handles all pricing calculations for the quote wizard.
 * Looks up rates from the database and applies the pricing formula.
 */
@Injectable()
export class QuoterService {
  constructor(
    @InjectRepository(PageRate) private pageRateRepo: Repository<PageRate>,
    @InjectRepository(CoverRate) private coverRateRepo: Repository<CoverRate>,
    @InjectRepository(BindingRate) private bindingRateRepo: Repository<BindingRate>,
    @InjectRepository(Quote) private quoteRepo: Repository<Quote>,
  ) {}

  /**
   * Calculates the full price breakdown for the given quote configuration.
   * @param dto - Validated quote configuration from the wizard
   * @returns Fully calculated PriceBreakdown with all line items
   * @throws NotFoundException if any required rate record is missing
   */
  async calculatePrice(dto: CalculateQuoteDto): Promise<PriceBreakdown> {
    const pageRate = await this.pageRateRepo.findOne({
      where: {
        printType: { id: dto.printTypeId },
        paperStock: { id: dto.paperStockId },
      },
    });
    if (!pageRate) {
      throw new NotFoundException(
        `No page rate found for printTypeId=${dto.printTypeId}, paperStockId=${dto.paperStockId}`,
      );
    }

    const coverRate = await this.coverRateRepo.findOne({
      where: {
        coverStyle: { id: dto.coverStyleId },
        coverFinish: { id: dto.coverFinishId },
      },
    });
    if (!coverRate) {
      throw new NotFoundException(
        `No cover rate found for coverStyleId=${dto.coverStyleId}, coverFinishId=${dto.coverFinishId}`,
      );
    }

    const bindingRate = await this.bindingRateRepo.findOne({
      where: { bindingType: { id: dto.bindingTypeId } },
    });
    if (!bindingRate) {
      throw new NotFoundException(`No binding rate found for bindingTypeId=${dto.bindingTypeId}`);
    }

    const pageCost = Math.round(Number(pageRate.ratePerPage) * dto.pageCount * 100) / 100;
    const coverCost = Math.round(Number(coverRate.basePrice) * 100) / 100;
    const bindingCost = Math.round(Number(bindingRate.surcharge) * 100) / 100;
    const subtotal = Math.round((pageCost + coverCost + bindingCost) * dto.quantity * 100) / 100;
    const tax = Math.round(subtotal * 0.08 * 100) / 100;
    const total = Math.round((subtotal + tax) * 100) / 100;

    return { pageCost, coverCost, bindingCost, subtotal, tax, total };
  }

  /**
   * Calculates price and persists the quote to the database.
   * @param dto - Validated quote configuration from the wizard
   * @param userId - ID of the authenticated user saving the quote
   * @returns The saved Quote entity with all fields populated
   */
  async saveQuote(dto: CalculateQuoteDto, userId: number): Promise<Quote> {
    const breakdown = await this.calculatePrice(dto);

    const quote = this.quoteRepo.create({
      config: {
        trimSizeId: dto.trimSizeId,
        coverStyleId: dto.coverStyleId,
        coverFinishId: dto.coverFinishId,
        printTypeId: dto.printTypeId,
        paperStockId: dto.paperStockId,
        bindingTypeId: dto.bindingTypeId,
      },
      pageCount: dto.pageCount,
      quantity: dto.quantity,
      totalPrice: breakdown.total,
      priceBreakdown: breakdown,
      user: { id: userId } as User,
    });

    return this.quoteRepo.save(quote);
  }

  /**
   * Returns all quotes saved by a specific user, newest first.
   * @param userId - The authenticated user's ID
   * @returns Array of Quote entities ordered by createdAt descending
   */
  async getUserQuotes(userId: number): Promise<Quote[]> {
    return this.quoteRepo.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }
}
