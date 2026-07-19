import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BindingRate } from '../../entities/binding-rate.entity';
import { Coupon } from '../../entities/coupon.entity';
import { CouponUsage } from '../../entities/coupon-usage.entity';
import { CoverRate } from '../../entities/cover-rate.entity';
import { PageRate } from '../../entities/page-rate.entity';
import { Quote } from '../../entities/quote.entity';
import { AuthModule } from '../auth/auth.module';
import { QuoterController } from './quoter.controller';
import { QuoterService } from './quoter.service';

/** Registers all pricing and quote-saving resources for the Phase 2 pricing engine */
@Module({
  imports: [
    TypeOrmModule.forFeature([PageRate, CoverRate, BindingRate, Quote, Coupon, CouponUsage]),
    AuthModule,
  ],
  controllers: [QuoterController],
  providers: [QuoterService],
})
export class QuoterModule {}
