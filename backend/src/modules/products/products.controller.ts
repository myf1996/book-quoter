import { Controller, Get } from '@nestjs/common';
import { BindingType } from '../../entities/binding-type.entity';
import { CoverFinish } from '../../entities/cover-finish.entity';
import { CoverStyle } from '../../entities/cover-style.entity';
import { PaperStock } from '../../entities/paper-stock.entity';
import { PrintType } from '../../entities/print-type.entity';
import { TrimSize } from '../../entities/trim-size.entity';
import { ProductsService } from './products.service';

/**
 * Exposes product catalogue endpoints consumed by the quoter wizard.
 * All routes are under /api/products.
 */
@Controller('api/products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  /** GET /api/products/trim-sizes */
  @Get('trim-sizes')
  getTrimSizes(): Promise<TrimSize[]> {
    return this.productsService.getAllTrimSizes();
  }

  /** GET /api/products/cover-styles */
  @Get('cover-styles')
  getCoverStyles(): Promise<CoverStyle[]> {
    return this.productsService.getAllCoverStyles();
  }

  /** GET /api/products/cover-finishes */
  @Get('cover-finishes')
  getCoverFinishes(): Promise<CoverFinish[]> {
    return this.productsService.getAllCoverFinishes();
  }

  /** GET /api/products/print-types */
  @Get('print-types')
  getPrintTypes(): Promise<PrintType[]> {
    return this.productsService.getAllPrintTypes();
  }

  /** GET /api/products/paper-stocks */
  @Get('paper-stocks')
  getPaperStocks(): Promise<PaperStock[]> {
    return this.productsService.getAllPaperStocks();
  }

  /** GET /api/products/binding-types */
  @Get('binding-types')
  getBindingTypes(): Promise<BindingType[]> {
    return this.productsService.getAllBindingTypes();
  }
}
