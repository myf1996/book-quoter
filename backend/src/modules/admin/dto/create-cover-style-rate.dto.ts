import { IsNumber, IsPositive, IsUUID } from 'class-validator';

export class CreateCoverStyleRateDto {
  @IsUUID()
  coverStyleId: string;

  @IsNumber()
  @IsPositive()
  basePrice: number;
}
