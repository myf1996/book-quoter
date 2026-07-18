import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export interface QuoteConfig {
  trimSizeId: number;
  coverStyleId: number;
  coverFinishId: number;
  printTypeId: number;
  paperStockId: number;
  bindingTypeId: number;
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
export class Quote {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'jsonb' })
  config: QuoteConfig;

  @Column({ name: 'page_count' })
  pageCount: number;

  @Column({ name: 'quantity' })
  quantity: number;

  @Column('decimal', { name: 'total_price', precision: 10, scale: 2 })
  totalPrice: number;

  @Column({ name: 'price_breakdown', type: 'jsonb' })
  priceBreakdown: PriceBreakdown;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
