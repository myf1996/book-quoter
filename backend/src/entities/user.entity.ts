import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseAppEntity } from './base-app.entity';

/** Roles available in the system */
export enum UserRole {
  ADMIN = 'admin',
  CUSTOMER = 'customer',
}

/** Represents a registered user who can save quotes */
@Entity('users')
export class User extends BaseAppEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 255, unique: true })
  email: string;

  @Column({ length: 255 })
  passwordHash: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.CUSTOMER })
  role: UserRole;
}
