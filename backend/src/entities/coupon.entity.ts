import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseAppEntity } from './base-app.entity';
import { User } from './user.entity';

export enum DiscountType {
  FIXED = 'fixed',
  PERCENTAGE = 'percentage',
}

/** Represents a discount coupon that can be applied to a saved quote */
@Entity('coupons')
export class Coupon extends BaseAppEntity {
  /** Unique coupon code (stored uppercase) */
  @Column({ unique: true })
  code: string;

  @Column({ type: 'enum', enum: DiscountType })
  discountType: DiscountType;

  /** Dollar amount (fixed) or percentage value (percentage) */
  @Column('decimal', { precision: 10, scale: 2 })
  discountValue: number;

  /** If set, only this user can apply the coupon; null = available to all */
  @ManyToOne(() => User, { nullable: true, onDelete: 'RESTRICT' })
  applicableUser: User | null;

  /** Maximum number of times a single user can redeem this coupon (default 1) */
  @Column({ default: 1 })
  maxUsesPerUser: number;

  /** Maximum redemptions across all users; null = unlimited */
  @Column({ type: 'int', nullable: true })
  totalMaxUses: number | null;

  /** Optional expiry timestamp; null = never expires */
  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date | null;
}
