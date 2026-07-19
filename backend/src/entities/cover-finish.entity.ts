import { Column, Entity } from 'typeorm';
import { BaseAppEntity } from './base-app.entity';

/** Represents a cover finish option (e.g. Gloss, Matte) */
@Entity('cover_finishes')
export class CoverFinish extends BaseAppEntity {
  @Column({ length: 100, unique: true })
  name: string;
}
