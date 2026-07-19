import { Entity, ManyToOne } from 'typeorm';
import { Coupon } from './coupon.entity';
import { Quote } from './quote.entity';
import { User } from './user.entity';
import { BaseAppEntity } from './base-app.entity';

/** Records each redemption of a coupon against a saved quote */
@Entity('coupon_usages')
export class CouponUsage extends BaseAppEntity {
  @ManyToOne(() => Coupon, { onDelete: 'RESTRICT' })
  coupon: Coupon;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  user: User;

  @ManyToOne(() => Quote, { nullable: true, onDelete: 'RESTRICT' })
  quote: Quote | null;
}
