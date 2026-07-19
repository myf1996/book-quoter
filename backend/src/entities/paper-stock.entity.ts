import { Column, Entity } from 'typeorm';
import { BaseAppEntity } from './base-app.entity';

/** Represents a paper stock option (e.g. 60lb Natural) */
@Entity('paper_stocks')
export class PaperStock extends BaseAppEntity {
  @Column({ length: 100, unique: true })
  name: string;

  @Column({ length: 50, nullable: true })
  weight: string;
}
