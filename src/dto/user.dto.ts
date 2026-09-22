import { IsString, IsOptional, IsObject } from 'class-validator';

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
