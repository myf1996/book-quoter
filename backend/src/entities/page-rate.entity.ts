import { CreateDateColumn, Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

/** Stores the per-page printing cost for a given print type + paper stock combination */
@Entity('page_rates')
@Unique(['printTypeId', 'paperStockId'])
export class PageRate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'print_type_id' })
  printTypeId: number;

  @Column({ name: 'paper_stock_id' })
  paperStockId: number;

  /** Cost per page in USD */
  @Column('decimal', { name: 'rate_per_page', precision: 8, scale: 4 })
  ratePerPage: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
