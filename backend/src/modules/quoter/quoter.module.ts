import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BindingRate } from '../../entities/binding-rate.entity';
import { Coupon } from '../../entities/coupon.entity';
import { CouponUsage } from '../../entities/coupon-usage.entity';
import { CoverFinishRate } from '../../entities/cover-finish-rate.entity';
import { CoverStyleRate } from '../../entities/cover-style-rate.entity';
import { PageRate } from '../../entities/page-rate.entity';
import { Quote } from '../../entities/quote.entity';
import { TrimSize } from '../../entities/trim-size.entity';
import { AuthModule } from '../auth/auth.module';
import { QuoterController } from './quoter.controller';
import { QuoterService } from './quoter.service';

/** Registers all pricing and quote-saving resources for the Phase 2 pricing engine */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      TrimSize, PageRate, CoverStyleRate, CoverFinishRate, BindingRate,
      Quote, Coupon, CouponUsage,
    ]),
    AuthModule,
  ],
  controllers: [QuoterController],
  providers: [QuoterService],
})
export class QuoterModule {}
