import { IsString, MinLength } from 'class-validator';

/** DTO for updating the user's display name */
export class UpdateProfileDto {
  @IsString()
  @MinLength(2)
  name: string;
}
