import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ProductStatus } from '../common/enums/product-status.enum';
import { BaseAppEntity } from './base-app.entity';

/** Represents a print type option (e.g. Black & White, Color) */
@Entity('print_types')
export class PrintType extends BaseAppEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100, unique: true })
  name: string;

  @Column({ type: 'enum', enum: ProductStatus, default: ProductStatus.INACTIVE })
  status: ProductStatus;
}
