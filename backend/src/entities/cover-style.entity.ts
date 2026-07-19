import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ProductStatus } from '../common/enums/product-status.enum';
import { BaseAppEntity } from './base-app.entity';

/** Represents a book cover style option (e.g. Softcover, Hardcover) */
@Entity('cover_styles')
export class CoverStyle extends BaseAppEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100, unique: true })
  name: string;

  @Column({ type: 'enum', enum: ProductStatus, default: ProductStatus.INACTIVE })
  status: ProductStatus;
}
