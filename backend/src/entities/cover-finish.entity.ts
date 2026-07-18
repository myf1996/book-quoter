import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/** Represents a cover finish option (e.g. Gloss, Matte) */
@Entity('cover_finishes')
export class CoverFinish {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, unique: true })
  name: string;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
