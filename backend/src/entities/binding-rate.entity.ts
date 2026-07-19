import { Column, Entity, ManyToOne, Unique } from 'typeorm';
import { BaseAppEntity } from './base-app.entity';
import { BindingType } from './binding-type.entity';

/** Stores the binding surcharge for a given binding type */
@Entity('binding_rates')
@Unique(['bindingType'])
export class BindingRate extends BaseAppEntity {
  @ManyToOne(() => BindingType, { onDelete: 'RESTRICT' })
  bindingType: BindingType;

  /** Binding surcharge in USD */
  @Column('decimal', { precision: 8, scale: 2 })
  surcharge: number;
}
