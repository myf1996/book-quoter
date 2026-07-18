import { IsEmail, IsString, MinLength } from 'class-validator';

/** DTO for user registration — validates name, email format and minimum password length */
export class RegisterDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}
