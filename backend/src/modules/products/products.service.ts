import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductStatus } from '../../common/enums/product-status.enum';
import { BindingRate } from '../../entities/binding-rate.entity';
import { BindingType } from '../../entities/binding-type.entity';
import { CoverFinish } from '../../entities/cover-finish.entity';
import { CoverFinishRate } from '../../entities/cover-finish-rate.entity';
import { CoverStyle } from '../../entities/cover-style.entity';
import { CoverStyleRate } from '../../entities/cover-style-rate.entity';
import { PageRate } from '../../entities/page-rate.entity';
import { PaperStock } from '../../entities/paper-stock.entity';
import { PrintType } from '../../entities/print-type.entity';
import { TrimSize } from '../../entities/trim-size.entity';

export interface RatesResponse {
  trimSizeMultipliers: { trimSizeId: string; pricingMultiplier: number }[];
  pageRates: { printTypeId: string; paperStockId: string; ratePerPage: number }[];
  coverStyleRates: { coverStyleId: string; basePrice: number }[];
  coverFinishRates: { coverFinishId: string; addOnPrice: number }[];
  bindingRates: { bindingTypeId: string; surcharge: number }[];
}

const ACTIVE = { status: ProductStatus.ACTIVE };

/**
 * Handles all product catalogue queries for the quoter wizard.
 * Only returns ACTIVE items so inactive options never reach customers.
 */
@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(TrimSize)       private trimSizeRepo:       Repository<TrimSize>,
    @InjectRepository(CoverStyle)     private coverStyleRepo:     Repository<CoverStyle>,
    @InjectRepository(CoverFinish)    private coverFinishRepo:    Repository<CoverFinish>,
    @InjectRepository(PrintType)      private printTypeRepo:      Repository<PrintType>,
    @InjectRepository(PaperStock)     private paperStockRepo:     Repository<PaperStock>,
    @InjectRepository(BindingType)    private bindingTypeRepo:    Repository<BindingType>,
    @InjectRepository(PageRate)       private pageRateRepo:       Repository<PageRate>,
    @InjectRepository(CoverStyleRate) private coverStyleRateRepo: Repository<CoverStyleRate>,
    @InjectRepository(CoverFinishRate) private coverFinishRateRepo: Repository<CoverFinishRate>,
    @InjectRepository(BindingRate)    private bindingRateRepo:    Repository<BindingRate>,
  ) {}

  /** @returns Active trim sizes visible to customers */
  getAllTrimSizes(): Promise<TrimSize[]> {
    return this.trimSizeRepo.find({ where: ACTIVE, order: { id: 'ASC' } });
  }

  /** @returns Active cover styles visible to customers */
  getAllCoverStyles(): Promise<CoverStyle[]> {
    return this.coverStyleRepo.find({ where: ACTIVE, order: { id: 'ASC' } });
  }

  /** @returns Active cover finishes visible to customers */
  getAllCoverFinishes(): Promise<CoverFinish[]> {
    return this.coverFinishRepo.find({ where: ACTIVE, order: { id: 'ASC' } });
  }

  /** @returns Active print types visible to customers */
  getAllPrintTypes(): Promise<PrintType[]> {
    return this.printTypeRepo.find({ where: ACTIVE, order: { id: 'ASC' } });
  }

  /** @returns Active paper stocks visible to customers */
  getAllPaperStocks(): Promise<PaperStock[]> {
    return this.paperStockRepo.find({ where: ACTIVE, order: { id: 'ASC' } });
  }

  /** @returns Active binding types visible to customers */
  getAllBindingTypes(): Promise<BindingType[]> {
    return this.bindingTypeRepo.find({ where: ACTIVE, order: { id: 'ASC' } });
  }

  /** @returns All rate tables for client-side partial price estimation */
  async getAllRates(): Promise<RatesResponse> {
    const [trimSizes, pageRates, coverStyleRates, coverFinishRates, bindingRates] = await Promise.all([
      this.trimSizeRepo.find({ order: { id: 'ASC' } }),
      this.pageRateRepo.find({ relations: ['printType', 'paperStock'] }),
      this.coverStyleRateRepo.find({ relations: ['coverStyle'] }),
      this.coverFinishRateRepo.find({ relations: ['coverFinish'] }),
      this.bindingRateRepo.find({ relations: ['bindingType'] }),
    ]);
    return {
      trimSizeMultipliers: trimSizes.map((t) => ({
        trimSizeId: t.id,
        pricingMultiplier: Number(t.pricingMultiplier) || 1,
      })),
      pageRates: pageRates.map((r) => ({
        printTypeId: r.printType.id,
        paperStockId: r.paperStock.id,
        ratePerPage: Number(r.ratePerPage),
      })),
      coverStyleRates: coverStyleRates.map((r) => ({
        coverStyleId: r.coverStyle.id,
        basePrice: Number(r.basePrice),
      })),
      coverFinishRates: coverFinishRates.map((r) => ({
        coverFinishId: r.coverFinish.id,
        addOnPrice: Number(r.addOnPrice),
      })),
      bindingRates: bindingRates.map((r) => ({
        bindingTypeId: r.bindingType.id,
        surcharge: Number(r.surcharge),
      })),
    };
  }
}
