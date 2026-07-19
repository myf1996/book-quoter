import { PartialType } from '@nestjs/mapped-types';
import { CreatePageRateDto } from './create-page-rate.dto';

/** DTO for updating an existing page rate — all fields optional */
export class UpdatePageRateDto extends PartialType(CreatePageRateDto) {}
