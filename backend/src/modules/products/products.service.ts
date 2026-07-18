import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BindingType } from '../../entities/binding-type.entity';
import { CoverFinish } from '../../entities/cover-finish.entity';
import { CoverStyle } from '../../entities/cover-style.entity';
import { PaperStock } from '../../entities/paper-stock.entity';
import { PrintType } from '../../entities/print-type.entity';
import { TrimSize } from '../../entities/trim-size.entity';

/**
 * Handles all product catalogue queries for the quoter wizard.
 * Each method returns the full list for its product type.
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

  /** @returns All available trim sizes */
  getAllTrimSizes(): Promise<TrimSize[]> {
    return this.trimSizeRepo.find({ order: { id: 'ASC' } });
  }

  /** @returns All available cover styles */
  getAllCoverStyles(): Promise<CoverStyle[]> {
    return this.coverStyleRepo.find({ order: { id: 'ASC' } });
  }

  /** @returns All available cover finishes */
  getAllCoverFinishes(): Promise<CoverFinish[]> {
    return this.coverFinishRepo.find({ order: { id: 'ASC' } });
  }

  /** @returns All available print types */
  getAllPrintTypes(): Promise<PrintType[]> {
    return this.printTypeRepo.find({ order: { id: 'ASC' } });
  }

  /** @returns All available paper stocks */
  getAllPaperStocks(): Promise<PaperStock[]> {
    return this.paperStockRepo.find({ order: { id: 'ASC' } });
  }

  /** @returns All available binding types */
  getAllBindingTypes(): Promise<BindingType[]> {
    return this.bindingTypeRepo.find({ order: { id: 'ASC' } });
  }
}
