import { Column, CreateDateColumn, DeleteDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { ProductStatus } from '../common/enums/product-status.enum';

/**
 * Abstract base extended by every entity.
 * Provides createdAt, updatedAt and deletedAt (soft-delete) columns automatically
 * via SnakeNamingStrategy → created_at, deleted_at.
 */
export abstract class BaseAppEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: ProductStatus, default: ProductStatus.ACTIVE })
  status: ProductStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}
