import { PartialType } from '@nestjs/mapped-types';
import { CreateCoverRateDto } from './create-cover-rate.dto';

/** DTO for updating an existing cover rate — all fields optional */
export class UpdateCoverRateDto extends PartialType(CreateCoverRateDto) {}
