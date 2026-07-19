import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { DiscountType } from '../../../entities/coupon.entity';

/** DTO for creating a new coupon */
export class CreateCouponDto {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: { value: string }) => value.toUpperCase().trim())
  code: string;

  @IsEnum(DiscountType)
  discountType: DiscountType;

  @IsInt()
  @Min(0)
  discountValue: number;

  /** Optional — restrict this coupon to a specific user by their UUID */
  @IsOptional()
  @IsUUID()
  applicableUserId?: string;

  /** How many times the same user can redeem this coupon (default 1) */
  @IsOptional()
  @IsInt()
  @Min(1)
  maxUsesPerUser?: number;

  /** Maximum total redemptions across all users; omit for unlimited */
  @IsOptional()
  @IsInt()
  @Min(1)
  totalMaxUses?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  /** ISO 8601 timestamp; omit for no expiry */
  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}
