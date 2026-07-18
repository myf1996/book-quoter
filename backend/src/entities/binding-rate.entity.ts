import { CreateDateColumn, Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

/** Stores the binding surcharge for a given binding type */
@Entity('binding_rates')
@Unique(['bindingTypeId'])
export class BindingRate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'binding_type_id' })
  bindingTypeId: number;

  /** Binding surcharge in USD */
  @Column('decimal', { name: 'surcharge', precision: 8, scale: 2 })
  surcharge: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
