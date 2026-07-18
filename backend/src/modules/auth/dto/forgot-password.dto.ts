import { IsEmail } from 'class-validator';

/** DTO for initiating a password reset — validates the email format */
export class ForgotPasswordDto {
  @IsEmail()
  email: string;
}
