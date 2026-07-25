import { IsNumber, IsOptional, IsPositive, IsUUID } from 'class-validator';

export class UpdateCoverFinishRateDto {
  @IsOptional()
  @IsUUID()
  coverFinishId?: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  addOnPrice?: number;
}
