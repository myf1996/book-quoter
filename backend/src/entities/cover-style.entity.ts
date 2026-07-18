import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseAppEntity } from './base-app.entity';

/** Represents a book cover style option (e.g. Softcover, Hardcover) */
@Entity('cover_styles')
export class CoverStyle extends BaseAppEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, unique: true })
  name: string;
}
