import { Column, Entity, ManyToOne, Unique } from 'typeorm';
import { BaseAppEntity } from './base-app.entity';
import { CoverFinish } from './cover-finish.entity';

/** Per-finish add-on price — added on top of CoverStyleRate to get final cover cost */
@Entity('cover_finish_rates')
@Unique(['coverFinish'])
export class CoverFinishRate extends BaseAppEntity {
  @ManyToOne(() => CoverFinish, { onDelete: 'RESTRICT' })
  coverFinish: CoverFinish;

  /** Add-on per-copy cost for this finish in USD (e.g. Gloss $1.50, Matte $2.00) */
  @Column('decimal', { precision: 8, scale: 2 })
  addOnPrice: number;
}
