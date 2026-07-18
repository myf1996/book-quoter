import { IsNumber, IsPositive, Max, Min } from 'class-validator';

/** DTO for the calculate price endpoint — validates all wizard selections */
export class CalculateQuoteDto {
  @IsNumber()
  @IsPositive()
  trimSizeId: number;

  @IsNumber()
  @IsPositive()
  coverStyleId: number;

  @IsNumber()
  @IsPositive()
  coverFinishId: number;

  @IsNumber()
  @IsPositive()
  printTypeId: number;

  @IsNumber()
  @IsPositive()
  paperStockId: number;

  @IsNumber()
  @IsPositive()
  bindingTypeId: number;

  @IsNumber()
  @Min(24)
  @Max(840)
  pageCount: number;

  @IsNumber()
  @Min(1)
  quantity: number;
}
