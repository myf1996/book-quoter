import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/** Represents a binding type option (e.g. Perfect Bind, Saddle Stitch) */
@Entity('binding_types')
export class BindingType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, unique: true })
  name: string;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
