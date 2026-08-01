import { IsOptional, IsString } from 'class-validator';

export class CreateEmployeeDto {
  @IsString()
  nome: string;

  @IsString()
  cpf: string;

  @IsOptional()
  @IsString()
  telefone?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  ativo?: boolean;
}

export class UpdateEmployeeDto {
  @IsOptional()
  @IsString()
  nome?: string;

  @IsOptional()
  @IsString()
  cpf?: string;

  @IsOptional()
  @IsString()
  telefone?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  ativo?: boolean;
}
