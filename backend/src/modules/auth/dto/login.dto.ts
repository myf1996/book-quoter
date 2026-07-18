import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

/** DTO for user login — validates email format and non-empty password */
export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
