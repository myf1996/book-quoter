import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseAppEntity } from './base-app.entity';

/** Represents a paper stock option (e.g. 60lb Natural) */
@Entity('paper_stocks')
export class PaperStock extends BaseAppEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, unique: true })
  name: string;

  @Column({ length: 50, nullable: true })
  weight: string;
}
