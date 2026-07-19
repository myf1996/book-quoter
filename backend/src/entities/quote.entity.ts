import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BaseAppEntity } from './base-app.entity';
import { User } from './user.entity';

export interface QuoteConfig {
  trimSizeId: string;
  coverStyleId: string;
  coverFinishId: string;
  printTypeId: string;
  paperStockId: string;
  bindingTypeId: string;
}

/** Full price breakdown for a quote */
export interface PriceBreakdown {
  pageCost: number;
  coverCost: number;
  bindingCost: number;
  subtotal: number;
  tax: number;
  total: number;
}

/** Stores a completed quote configuration with pricing */
@Entity('quotes')
export class Quote extends BaseAppEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'jsonb' })
  config: QuoteConfig;

  @Column()
  pageCount: number;

  @Column()
  quantity: number;

  @Column('decimal', { precision: 10, scale: 2 })
  totalPrice: number;

  @Column({ type: 'jsonb' })
  priceBreakdown: PriceBreakdown;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  user: User | null;
}
