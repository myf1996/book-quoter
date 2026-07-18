import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/** Represents a book cover style option (e.g. Softcover, Hardcover) */
@Entity('cover_styles')
export class CoverStyle {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, unique: true })
  name: string;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
