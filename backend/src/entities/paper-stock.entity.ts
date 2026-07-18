import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/** Represents a paper stock option (e.g. 60lb Natural) */
@Entity('paper_stocks')
export class PaperStock {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, unique: true })
  name: string;

  @Column({ length: 50, nullable: true })
  weight: string;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
