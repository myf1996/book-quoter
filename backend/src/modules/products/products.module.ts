import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BindingType } from '../../entities/binding-type.entity';
import { CoverFinish } from '../../entities/cover-finish.entity';
import { CoverStyle } from '../../entities/cover-style.entity';
import { PaperStock } from '../../entities/paper-stock.entity';
import { PrintType } from '../../entities/print-type.entity';
import { TrimSize } from '../../entities/trim-size.entity';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

@Module({
  imports: [TypeOrmModule.forFeature([TrimSize, CoverStyle, CoverFinish, PrintType, PaperStock, BindingType])],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
