import { IsNumber, IsPositive, IsUUID } from 'class-validator';

export class CreateCoverFinishRateDto {
  @IsUUID()
  coverFinishId: string;

  @IsNumber()
  @IsPositive()
  addOnPrice: number;
}
