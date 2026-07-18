import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  newPassword: string;

  @IsString()
  @IsOptional()
  otp?: string;
}
