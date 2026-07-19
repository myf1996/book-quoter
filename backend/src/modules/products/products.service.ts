import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductStatus } from '../../common/enums/product-status.enum';
import { BindingType } from '../../entities/binding-type.entity';
import { CoverFinish } from '../../entities/cover-finish.entity';
import { CoverStyle } from '../../entities/cover-style.entity';
import { PaperStock } from '../../entities/paper-stock.entity';
import { PrintType } from '../../entities/print-type.entity';
import { TrimSize } from '../../entities/trim-size.entity';

const ACTIVE = { status: ProductStatus.ACTIVE };

/**
 * Handles all product catalogue queries for the quoter wizard.
 * Only returns ACTIVE items so inactive options never reach customers.
 */
@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(TrimSize) private trimSizeRepo: Repository<TrimSize>,
    @InjectRepository(CoverStyle) private coverStyleRepo: Repository<CoverStyle>,
    @InjectRepository(CoverFinish) private coverFinishRepo: Repository<CoverFinish>,
    @InjectRepository(PrintType) private printTypeRepo: Repository<PrintType>,
    @InjectRepository(PaperStock) private paperStockRepo: Repository<PaperStock>,
    @InjectRepository(BindingType) private bindingTypeRepo: Repository<BindingType>,
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
}
