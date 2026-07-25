import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BindingRate } from '../../entities/binding-rate.entity';
import { BindingType } from '../../entities/binding-type.entity';
import { ProductStatus } from '../../common/enums/product-status.enum';
import { Coupon, DiscountType } from '../../entities/coupon.entity';
import { CouponUsage } from '../../entities/coupon-usage.entity';
import { CoverFinish } from '../../entities/cover-finish.entity';
import { CoverFinishRate } from '../../entities/cover-finish-rate.entity';
import { CoverStyle } from '../../entities/cover-style.entity';
import { CoverStyleRate } from '../../entities/cover-style-rate.entity';
import { PageRate } from '../../entities/page-rate.entity';
import { PaperStock } from '../../entities/paper-stock.entity';
import { PrintType } from '../../entities/print-type.entity';
import { PriceBreakdown, Quote } from '../../entities/quote.entity';
import { TrimSize } from '../../entities/trim-size.entity';
import { User } from '../../entities/user.entity';
import { CalculateQuoteDto } from './dto/calculate-quote.dto';

export interface CouponValidationResult {
  code: string;
  discountType: DiscountType;
  discountValue: number;
}

/**
 * Handles all pricing calculations and quote persistence for the wizard.
 */
@Injectable()
export class QuoterService {
  constructor(
    @InjectRepository(TrimSize)        private trimSizeRepo:        Repository<TrimSize>,
    @InjectRepository(PageRate)        private pageRateRepo:        Repository<PageRate>,
    @InjectRepository(CoverStyleRate)  private coverStyleRateRepo:  Repository<CoverStyleRate>,
    @InjectRepository(CoverFinishRate) private coverFinishRateRepo: Repository<CoverFinishRate>,
    @InjectRepository(BindingRate)     private bindingRateRepo:     Repository<BindingRate>,
    @InjectRepository(Quote)           private quoteRepo:           Repository<Quote>,
    @InjectRepository(Coupon)          private couponRepo:          Repository<Coupon>,
    @InjectRepository(CouponUsage)     private couponUsageRepo:     Repository<CouponUsage>,
  ) {}

  /**
   * Calculates the full price breakdown for the given quote configuration.
   * @param dto - Validated quote configuration from the wizard
   * @returns Fully calculated PriceBreakdown with all line items
   * @throws NotFoundException if any required rate record is missing
   */
  async calculatePrice(dto: CalculateQuoteDto): Promise<PriceBreakdown> {
    const trimSize = await this.trimSizeRepo.findOneBy({ id: dto.trimSizeId });
    if (!trimSize) throw new NotFoundException(`TrimSize ${dto.trimSizeId} not found`);

    const pageRate = await this.pageRateRepo.findOne({
      where: { printType: { id: dto.printTypeId }, paperStock: { id: dto.paperStockId } },
    });
    if (!pageRate) throw new NotFoundException(`No page rate for printType=${dto.printTypeId}, paperStock=${dto.paperStockId}`);

    const coverStyleRate = await this.coverStyleRateRepo.findOne({
      where: { coverStyle: { id: dto.coverStyleId } },
    });
    if (!coverStyleRate) throw new NotFoundException(`No cover style rate for coverStyle=${dto.coverStyleId}`);

    const coverFinishRate = await this.coverFinishRateRepo.findOne({
      where: { coverFinish: { id: dto.coverFinishId } },
    });
    if (!coverFinishRate) throw new NotFoundException(`No cover finish rate for coverFinish=${dto.coverFinishId}`);

    const bindingRate = await this.bindingRateRepo.findOne({
      where: { bindingType: { id: dto.bindingTypeId } },
    });
    if (!bindingRate) throw new NotFoundException(`No binding rate for bindingType=${dto.bindingTypeId}`);

    const multiplier = Number(trimSize.pricingMultiplier) || 1;
    const pageCost       = Math.round(Number(pageRate.ratePerPage) * dto.pageCount * multiplier * 100) / 100;
    const coverStyleCost = Math.round(Number(coverStyleRate.basePrice) * 100) / 100;
    const coverFinishCost = Math.round(Number(coverFinishRate.addOnPrice) * 100) / 100;
    const coverCost      = Math.round((coverStyleCost + coverFinishCost) * 100) / 100;
    const bindingCost    = Math.round(Number(bindingRate.surcharge) * 100) / 100;
    const subtotal       = Math.round((pageCost + coverCost + bindingCost) * dto.quantity * 100) / 100;
    const tax            = Math.round(subtotal * 0.08 * 100) / 100;
    const total          = Math.round((subtotal + tax) * 100) / 100;

    return { pageCost, coverStyleCost, coverFinishCost, coverCost, bindingCost, subtotal, tax, total };
  }

  /**
   * Validates a coupon code for the given authenticated user.
   * Does not record usage — usage is recorded when the quote is saved.
   *
   * @param code - Raw coupon code (case-insensitive)
   * @param userId - ID of the user attempting to apply the coupon
   * @throws BadRequestException for any invalid/ineligible coupon
   */
  async validateCoupon(code: string, userId: string): Promise<CouponValidationResult> {
    const coupon = await this.couponRepo.findOne({
      where: { code: code.toUpperCase().trim(), status: ProductStatus.ACTIVE },
      relations: ['applicableUser'],
    });

    if (!coupon) {
      throw new BadRequestException('Coupon code not found or inactive.');
    }

    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      throw new BadRequestException('This coupon has expired.');
    }

    if (coupon.applicableUser && coupon.applicableUser.id !== userId) {
      throw new BadRequestException('This coupon is not applicable to your account.');
    }

    if (coupon.totalMaxUses !== null) {
      const totalUsed = await this.couponUsageRepo.count({
        where: { coupon: { id: coupon.id } },
      });
      if (totalUsed >= coupon.totalMaxUses) {
        throw new BadRequestException('This coupon has reached its maximum number of uses.');
      }
    }

    const userUsed = await this.couponUsageRepo.count({
      where: { coupon: { id: coupon.id }, user: { id: userId } },
    });
    if (userUsed >= coupon.maxUsesPerUser) {
      throw new BadRequestException('You have already used this coupon the maximum number of times.');
    }

    return {
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: Number(coupon.discountValue),
    };
  }

  /**
   * Calculates price and persists the quote to the database.
   * If a couponCode is provided it is re-validated and usage is recorded.
   *
   * @param dto - Validated quote configuration (may include optional couponCode)
   * @param userId - ID of the authenticated user saving the quote
   */
  async saveQuote(dto: CalculateQuoteDto, userId: string): Promise<Quote> {
    const breakdown = await this.calculatePrice(dto);

    let couponCode: string | null = null;
    let discountAmount: number | null = null;
    let finalTotal = breakdown.total;

    if (dto.couponCode?.trim()) {
      const coupon = await this.validateCoupon(dto.couponCode, userId);
      couponCode = coupon.code;

      if (coupon.discountType === DiscountType.PERCENTAGE) {
        discountAmount = Math.round((breakdown.total * coupon.discountValue) / 100 * 100) / 100;
      } else {
        discountAmount = Math.min(coupon.discountValue, breakdown.total);
        discountAmount = Math.round(discountAmount * 100) / 100;
      }

      finalTotal = Math.round((breakdown.total - discountAmount) * 100) / 100;
    }

    const quote = this.quoteRepo.create({
      trimSize: { id: dto.trimSizeId } as TrimSize,
      coverStyle: { id: dto.coverStyleId } as CoverStyle,
      coverFinish: { id: dto.coverFinishId } as CoverFinish,
      printType: { id: dto.printTypeId } as PrintType,
      paperStock: { id: dto.paperStockId } as PaperStock,
      bindingType: { id: dto.bindingTypeId } as BindingType,
      pageCount: dto.pageCount,
      quantity: dto.quantity,
      totalPrice: finalTotal,
      priceBreakdown: breakdown,
      couponCode,
      discountAmount,
      primaryColor: dto.primaryColor ?? null,
      secondaryColor: dto.secondaryColor ?? null,
      user: { id: userId } as User,
    });

    const saved = await this.quoteRepo.save(quote);

    // Record coupon usage after successful save
    if (couponCode) {
      const couponEntity = await this.couponRepo.findOneBy({ code: couponCode });
      if (couponEntity) {
        await this.couponUsageRepo.save(
          this.couponUsageRepo.create({
            coupon: couponEntity,
            user: { id: userId } as User,
            quote: saved,
          }),
        );
      }
    }

    return saved;
  }

  /**
   * Returns a paginated list of quotes for a specific user, newest first.
   * @param userId - The authenticated user's ID
   * @param page - 1-based page number (default 1)
   * @param limit - Items per page (default 20)
   */
  async getUserQuotes(
    userId: string,
    page = 1,
    limit = 20,
  ): Promise<{ data: Quote[]; total: number; page: number; limit: number; totalPages: number }> {
    const [data, total] = await this.quoteRepo.findAndCount({
      where: { user: { id: userId } },
      relations: ['trimSize', 'coverStyle', 'coverFinish', 'printType', 'paperStock', 'bindingType'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }
}
