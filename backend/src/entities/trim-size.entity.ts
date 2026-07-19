import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ProductStatus } from '../common/enums/product-status.enum';
import { BaseAppEntity } from './base-app.entity';

/** Represents a book trim size option (e.g. Digest 5.5×8.5) */
@Entity('trim_sizes')
export class TrimSize extends BaseAppEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100, unique: true })
  name: string;

  @Column({ type: 'enum', enum: ProductStatus, default: ProductStatus.INACTIVE })
  status: ProductStatus;

  @Column('decimal', { precision: 5, scale: 2 })
  width: number;

  @Column('decimal', { precision: 5, scale: 2 })
  height: number;

  @Column({ default: 24 })
  minPages: number;

  @Column({ default: 840 })
  maxPages: number;
}
