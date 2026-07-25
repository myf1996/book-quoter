import { Column, Entity, ManyToOne, Unique } from 'typeorm';
import { BaseAppEntity } from './base-app.entity';
import { CoverStyle } from './cover-style.entity';

/** Per-style base cover price — combined with CoverFinishRate to get final cover cost */
@Entity('cover_style_rates')
@Unique(['coverStyle'])
export class CoverStyleRate extends BaseAppEntity {
  @ManyToOne(() => CoverStyle, { onDelete: 'RESTRICT' })
  coverStyle: CoverStyle;

  /** Base per-copy cover cost for this style in USD (e.g. Softcover $2.50, Hardcover $7.00) */
  @Column('decimal', { precision: 8, scale: 2 })
  basePrice: number;
}
