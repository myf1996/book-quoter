import { Column, Entity } from 'typeorm';
import { BaseAppEntity } from './base-app.entity';

/** Represents a print type option (e.g. Black & White, Color) */
@Entity('print_types')
export class PrintType extends BaseAppEntity {
  @Column({ length: 100, unique: true })
  name: string;

  /** Default primary ink color as a hex string (e.g. #000000 for B&W). Null means user-defined (Color type). */
  @Column({ type: 'varchar', length: 7, nullable: true, default: null })
  primaryColor: string | null;

  /** Default secondary ink color as a hex string (e.g. #FFFFFF for B&W). Null means user-defined (Color type). */
  @Column({ type: 'varchar', length: 7, nullable: true, default: null })
  secondaryColor: string | null;
}
