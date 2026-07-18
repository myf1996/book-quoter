import { CreateDateColumn, DeleteDateColumn } from 'typeorm';

/**
 * Abstract base extended by every entity.
 * Provides createdAt and deletedAt (soft-delete) columns automatically
 * via SnakeNamingStrategy → created_at, deleted_at.
 */
export abstract class BaseAppEntity {
  @CreateDateColumn()
  createdAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}
