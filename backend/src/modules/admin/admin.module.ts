import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BindingRate } from '../../entities/binding-rate.entity';
import { BindingType } from '../../entities/binding-type.entity';
import { Coupon } from '../../entities/coupon.entity';
import { CouponUsage } from '../../entities/coupon-usage.entity';
import { CoverFinish } from '../../entities/cover-finish.entity';
import { CoverRate } from '../../entities/cover-rate.entity';
import { CoverStyle } from '../../entities/cover-style.entity';
import { PageRate } from '../../entities/page-rate.entity';
import { PaperStock } from '../../entities/paper-stock.entity';
import { PrintType } from '../../entities/print-type.entity';
import { Quote } from '../../entities/quote.entity';
import { TrimSize } from '../../entities/trim-size.entity';
import { User } from '../../entities/user.entity';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

/** Registers all admin panel routes and supporting services */
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
      User,
      Quote,
      Coupon,
      CouponUsage,
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
