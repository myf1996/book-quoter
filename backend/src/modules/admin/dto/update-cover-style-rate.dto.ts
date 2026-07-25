import { IsNumber, IsOptional, IsPositive, IsUUID } from 'class-validator';

export class UpdateCoverStyleRateDto {
  @IsOptional()
  @IsUUID()
  coverStyleId?: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  basePrice?: number;
}
