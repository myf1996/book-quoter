import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { ProductStatus } from '../../../common/enums/product-status.enum';

/** DTO for creating a new product option (trim size, cover style, etc.) */
export class CreateProductDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsEnum(ProductStatus)
  @IsOptional()
  status?: ProductStatus;
}
