import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseAppEntity } from './base-app.entity';
import { BindingType } from './binding-type.entity';
import { CoverFinish } from './cover-finish.entity';
import { CoverStyle } from './cover-style.entity';
import { PaperStock } from './paper-stock.entity';
import { PrintType } from './print-type.entity';
import { TrimSize } from './trim-size.entity';
import { User } from './user.entity';

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
  @ManyToOne(() => TrimSize, { nullable: false, onDelete: 'RESTRICT', eager: true })
  trimSize: TrimSize;

  @ManyToOne(() => CoverStyle, { nullable: false, onDelete: 'RESTRICT', eager: true })
  coverStyle: CoverStyle;

  @ManyToOne(() => CoverFinish, { nullable: false, onDelete: 'RESTRICT', eager: true })
  coverFinish: CoverFinish;

  @ManyToOne(() => PrintType, { nullable: false, onDelete: 'RESTRICT', eager: true })
  printType: PrintType;

  @ManyToOne(() => PaperStock, { nullable: false, onDelete: 'RESTRICT', eager: true })
  paperStock: PaperStock;

  @ManyToOne(() => BindingType, { nullable: false, onDelete: 'RESTRICT', eager: true })
  bindingType: BindingType;

  @Column()
  pageCount: number;

  @Column()
  quantity: number;

  @Column('decimal', { precision: 10, scale: 2 })
  totalPrice: number;

  @Column({ type: 'jsonb' })
  priceBreakdown: PriceBreakdown;

  @ManyToOne(() => User, { nullable: true, onDelete: 'RESTRICT' })
  user: User | null;

  /** Code of the coupon applied at save time; null if no coupon was used */
  @Column({ type: 'varchar', nullable: true, default: null })
  couponCode: string | null;

  /** Discount amount deducted from the base total; null if no coupon was used */
  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  discountAmount: number | null;
}
