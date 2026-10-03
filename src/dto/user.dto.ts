import { IsString, IsOptional, IsObject, MinLength } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  imagePath?: string;

  @IsObject()
  @IsOptional()
  company?: {
    name?: string;
    cnpj?: string;
    address?: string;
    phone?: string;
  };
}

export class ChangePasswordDto {
  @IsString()
  @MinLength(4)
  currentPassword: string;

  @IsString()
  @MinLength(4)
  newPassword: string;
}

export class ResetPasswordDto {
  @IsString()
  @MinLength(4)
  newPassword: string;
}
