import { IsNumber, IsPositive, IsUUID } from 'class-validator';

/** DTO for creating a binding rate entry */
export class CreateBindingRateDto {
  @IsUUID()
  bindingTypeId: string;

  /** Binding surcharge in USD */
  @IsNumber()
  @IsPositive()
  surcharge: number;
}
