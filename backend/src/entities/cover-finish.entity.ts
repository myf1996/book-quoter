import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseAppEntity } from './base-app.entity';

/** Represents a cover finish option (e.g. Gloss, Matte) */
@Entity('cover_finishes')
export class CoverFinish extends BaseAppEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, unique: true })
  name: string;
}
