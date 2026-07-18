import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { BaseAppEntity } from './base-app.entity';
import { CoverFinish } from './cover-finish.entity';
import { CoverStyle } from './cover-style.entity';

/** Stores the flat cover cost for a given cover style + cover finish combination */
@Entity('cover_rates')
@Unique(['coverStyle', 'coverFinish'])
export class CoverRate extends BaseAppEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => CoverStyle, { onDelete: 'RESTRICT' })
  coverStyle: CoverStyle;

  @ManyToOne(() => CoverFinish, { onDelete: 'RESTRICT' })
  coverFinish: CoverFinish;

  /** Flat cover cost in USD */
  @Column('decimal', { precision: 8, scale: 2 })
  basePrice: number;
}
