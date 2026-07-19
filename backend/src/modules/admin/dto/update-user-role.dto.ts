import { IsEnum } from 'class-validator';
import { UserRole } from '../../../entities/user.entity';

/** DTO for updating a user's role */
export class UpdateUserRoleDto {
  @IsEnum(UserRole)
  role: UserRole;
}
