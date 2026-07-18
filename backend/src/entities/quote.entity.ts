import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export interface QuoteConfig {
  trimSizeId: number;
  coverStyleId: number;
  coverFinishId: number;
  printTypeId: number;
  paperStockId: number;
  bindingTypeId: number;
}

/** Stores a completed quote configuration */
@Entity('quotes')
export class Quote {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'jsonb' })
  config: QuoteConfig;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
