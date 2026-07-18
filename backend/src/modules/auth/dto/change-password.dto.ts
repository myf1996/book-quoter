import { IsNotEmpty, IsString, MinLength } from 'class-validator';

/** DTO for changing the authenticated user's password */
export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @IsString()
  @MinLength(8)
  newPassword: string;
}
