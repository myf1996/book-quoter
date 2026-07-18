import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseAppEntity } from './base-app.entity';

/** Represents a print type option (e.g. Black & White, Color) */
@Entity('print_types')
export class PrintType extends BaseAppEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, unique: true })
  name: string;
}
