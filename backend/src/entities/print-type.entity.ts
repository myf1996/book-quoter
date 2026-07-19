import { Column, Entity } from 'typeorm';
import { BaseAppEntity } from './base-app.entity';

/** Represents a print type option (e.g. Black & White, Color) */
@Entity('print_types')
export class PrintType extends BaseAppEntity {
  @Column({ length: 100, unique: true })
  name: string;
}
