import { PartialType } from '@nestjs/mapped-types';
import { CreateCouponDto } from './create-coupon.dto';

/** DTO for partially updating an existing coupon */
export class UpdateCouponDto extends PartialType(CreateCouponDto) {}
