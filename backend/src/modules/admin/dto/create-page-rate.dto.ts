import { IsNumber, IsPositive, IsUUID } from 'class-validator';

/** DTO for creating a page rate entry */
export class CreatePageRateDto {
  @IsUUID()
  printTypeId: string;

  @IsUUID()
  paperStockId: string;

  @IsNumber()
  @IsPositive()
  ratePerPage: number;
}
