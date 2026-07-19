import { Column, Entity } from 'typeorm';
import { BaseAppEntity } from './base-app.entity';

/** Represents a binding type option (e.g. Perfect Bind, Saddle Stitch) */
@Entity('binding_types')
export class BindingType extends BaseAppEntity {
  @Column({ length: 100, unique: true })
  name: string;
}
