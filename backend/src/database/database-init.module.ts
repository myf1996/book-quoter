import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BindingRate } from '../entities/binding-rate.entity';
import { BindingType } from '../entities/binding-type.entity';
import { CoverFinish } from '../entities/cover-finish.entity';
import { CoverRate } from '../entities/cover-rate.entity';
import { CoverStyle } from '../entities/cover-style.entity';
import { PageRate } from '../entities/page-rate.entity';
import { PaperStock } from '../entities/paper-stock.entity';
import { PrintType } from '../entities/print-type.entity';
import { TrimSize } from '../entities/trim-size.entity';
import { DatabaseInitService } from './database-init.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TrimSize,
      CoverStyle,
      CoverFinish,
      PrintType,
      PaperStock,
      BindingType,
      PageRate,
      CoverRate,
      BindingRate,
    ]),
  ],
  providers: [DatabaseInitService],
})
export class DatabaseInitModule {}
