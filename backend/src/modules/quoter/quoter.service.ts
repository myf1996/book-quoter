import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BindingRate } from '../../entities/binding-rate.entity';
import { CoverRate } from '../../entities/cover-rate.entity';
import { PageRate } from '../../entities/page-rate.entity';
import { Quote } from '../../entities/quote.entity';
import { PriceBreakdown } from '../../entities/quote.entity';
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
      where: { printTypeId: dto.printTypeId, paperStockId: dto.paperStockId },
    });
    if (!pageRate) {
      throw new NotFoundException(
        `No page rate found for printTypeId=${dto.printTypeId}, paperStockId=${dto.paperStockId}`,
      );
    }

    const coverRate = await this.coverRateRepo.findOne({
      where: { coverStyleId: dto.coverStyleId, coverFinishId: dto.coverFinishId },
    });
    if (!coverRate) {
      throw new NotFoundException(
        `No cover rate found for coverStyleId=${dto.coverStyleId}, coverFinishId=${dto.coverFinishId}`,
      );
    }

    const bindingRate = await this.bindingRateRepo.findOne({
      where: { bindingTypeId: dto.bindingTypeId },
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
   * @returns The saved Quote entity with all fields populated
   */
  async saveQuote(dto: CalculateQuoteDto): Promise<Quote> {
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
    });

    return this.quoteRepo.save(quote);
  }
}
