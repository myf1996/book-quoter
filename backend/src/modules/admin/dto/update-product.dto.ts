import { PartialType } from '@nestjs/mapped-types';
import { IsHexColor, IsInt, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateProductDto } from './create-product.dto';

/** DTO for updating an existing product option — all fields optional.
 *  Extra fields (width/height for TrimSize, weight for PaperStock,
 *  primaryColor/secondaryColor for PrintType) are accepted here and
 *  applied via Object.assign in the service layer. */
export class UpdateProductDto extends PartialType(CreateProductDto) {
  /** TrimSize: page width in inches */
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  width?: number;

  /** TrimSize: page height in inches */
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  height?: number;

  /** TrimSize: minimum page count */
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(9999)
  @Type(() => Number)
  minPages?: number;

  /** TrimSize: maximum page count */
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(9999)
  @Type(() => Number)
  maxPages?: number;

  /** PaperStock: paper weight label (e.g. "60lb") */
  @IsOptional()
  @IsString()
  weight?: string;

  /** PrintType: primary brand colour as 6-digit hex (#RRGGBB) */
  @IsOptional()
  @IsHexColor()
  primaryColor?: string;

  /** PrintType: secondary brand colour as 6-digit hex (#RRGGBB) */
  @IsOptional()
  @IsHexColor()
  secondaryColor?: string;
}
