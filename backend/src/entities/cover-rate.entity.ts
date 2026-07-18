import { CreateDateColumn, Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

/** Stores the flat cover cost for a given cover style + cover finish combination */
@Entity('cover_rates')
@Unique(['coverStyleId', 'coverFinishId'])
export class CoverRate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'cover_style_id' })
  coverStyleId: number;

  @Column({ name: 'cover_finish_id' })
  coverFinishId: number;

  /** Flat cover cost in USD */
  @Column('decimal', { name: 'base_price', precision: 8, scale: 2 })
  basePrice: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
