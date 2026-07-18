import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/** Represents a print type option (e.g. Black & White, Color) */
@Entity('print_types')
export class PrintType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, unique: true })
  name: string;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
