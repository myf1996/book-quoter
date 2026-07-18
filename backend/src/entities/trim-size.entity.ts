import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/** Represents a book trim size option (e.g. Digest 5.5×8.5) */
@Entity('trim_sizes')
export class TrimSize {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, unique: true })
  name: string;

  @Column('decimal', { precision: 5, scale: 2 })
  width: number;

  @Column('decimal', { precision: 5, scale: 2 })
  height: number;

  @Column({ name: 'min_pages', default: 24 })
  minPages: number;

  @Column({ name: 'max_pages', default: 840 })
  maxPages: number;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
