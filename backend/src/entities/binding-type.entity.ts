import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ProductStatus } from '../common/enums/product-status.enum';
import { BaseAppEntity } from './base-app.entity';

/** Represents a binding type option (e.g. Perfect Bind, Saddle Stitch) */
@Entity('binding_types')
export class BindingType extends BaseAppEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100, unique: true })
  name: string;

  @Column({ type: 'enum', enum: ProductStatus, default: ProductStatus.INACTIVE })
  status: ProductStatus;
}
