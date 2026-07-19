import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { BaseAppEntity } from './base-app.entity';
import { PaperStock } from './paper-stock.entity';
import { PrintType } from './print-type.entity';

/** Stores the per-page printing cost for a given print type + paper stock combination */
@Entity('page_rates')
@Unique(['printType', 'paperStock'])
export class PageRate extends BaseAppEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => PrintType, { onDelete: 'RESTRICT' })
  printType: PrintType;

  @ManyToOne(() => PaperStock, { onDelete: 'RESTRICT' })
  paperStock: PaperStock;

  /** Cost per page in USD */
  @Column('decimal', { precision: 8, scale: 4 })
  ratePerPage: number;
}
