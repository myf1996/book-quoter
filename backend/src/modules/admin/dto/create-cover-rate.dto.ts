import { IsNumber, IsPositive, IsUUID } from 'class-validator';

/** DTO for creating a cover rate entry */
export class CreateCoverRateDto {
  @IsUUID()
  coverStyleId: string;

  @IsUUID()
  coverFinishId: string;

  /** Flat cover cost in USD */
  @IsNumber()
  @IsPositive()
  basePrice: number;
}
