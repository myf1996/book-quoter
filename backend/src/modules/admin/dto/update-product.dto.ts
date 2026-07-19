import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';

/** DTO for updating an existing product option — all fields optional */
export class UpdateProductDto extends PartialType(CreateProductDto) {}
