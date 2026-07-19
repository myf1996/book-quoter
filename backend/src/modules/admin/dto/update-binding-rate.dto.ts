import { PartialType } from '@nestjs/mapped-types';
import { CreateBindingRateDto } from './create-binding-rate.dto';

/** DTO for updating an existing binding rate — all fields optional */
export class UpdateBindingRateDto extends PartialType(CreateBindingRateDto) {}
