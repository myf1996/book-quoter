import { IsNumber, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

/** DTO for the calculate price endpoint — validates all wizard selections */
export class CalculateQuoteDto {
  @IsUUID()
  trimSizeId: string;

  @IsUUID()
  coverStyleId: string;

  @IsUUID()
  coverFinishId: string;

  @IsUUID()
  printTypeId: string;

  @IsUUID()
  paperStockId: string;

  @IsUUID()
  bindingTypeId: string;

  @IsNumber()
  @Min(24)
  @Max(840)
  pageCount: number;

  @IsNumber()
  @Min(1)
  quantity: number;

  /** Optional coupon code to apply when saving a quote */
  @IsOptional()
  @IsString()
  couponCode?: string;
}
