import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BindingRate } from '../../entities/binding-rate.entity';
import { CoverRate } from '../../entities/cover-rate.entity';
import { PageRate } from '../../entities/page-rate.entity';
import { Quote } from '../../entities/quote.entity';
import { QuoterController } from './quoter.controller';
import { QuoterService } from './quoter.service';

/** Registers all pricing and quote-saving resources for the Phase 2 pricing engine */
@Module({
  imports: [TypeOrmModule.forFeature([PageRate, CoverRate, BindingRate, Quote])],
  controllers: [QuoterController],
  providers: [QuoterService],
})
export class QuoterModule {}
