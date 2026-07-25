import { Column, Entity } from 'typeorm';
import { BaseAppEntity } from './base-app.entity';

/** Represents a book trim size option (e.g. Digest 5.5×8.5) */
@Entity('trim_sizes')
export class TrimSize extends BaseAppEntity {
  @Column({ length: 100, unique: true })
  name: string;

  @Column('decimal', { precision: 5, scale: 2 })
  width: number;

  @Column('decimal', { precision: 5, scale: 2 })
  height: number;

  @Column({ default: 24 })
  minPages: number;

  @Column({ default: 840 })
  maxPages: number;

  /** Multiplier applied to the per-page rate to account for paper size (e.g. 5.5×8.5 = 0.90, 8.5×11 = 1.40) */
  @Column('decimal', { precision: 4, scale: 2, default: 1.00 })
  pricingMultiplier: number;
}
