import { IsNotEmpty, IsString } from 'class-validator';

/** DTO for validating a coupon code before saving a quote */
export class ValidateCouponDto {
  @IsString()
  @IsNotEmpty()
  code: string;
}
