import { IsEmail, IsNotEmpty, Length, Matches } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @Length(6, 20)
  password: string;

  @IsNotEmpty()
  @Length(2, 50)
  name: string;
}

export class UpdateUserDto {
  @IsEmail()
  email?: string;

  @Length(2, 50)
  name?: string;
}

export class ChangePasswordDto {
  @IsNotEmpty()
  @Length(6, 20)
  currentPassword: string;

  @IsNotEmpty()
  @Length(6, 20)
  newPassword: string;
}

export class LoginDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}

export class AuthResponseDto {
  access_token: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}
