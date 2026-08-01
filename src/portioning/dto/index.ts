import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreatePortioningDto {
  @IsString()
  produtoId: string;

  @IsNumber()
  quantidade: number;

  @IsString()
  unidadeBase: string;

  @IsNumber()
  porcoes: number;

  @IsString()
  unidadePorcao: string;

  @IsOptional()
  ativo?: boolean;
}

export class UpdatePortioningDto {
  @IsOptional()
  @IsNumber()
  quantidade?: number;

  @IsOptional()
  @IsString()
  unidadeBase?: string;

  @IsOptional()
  @IsNumber()
  porcoes?: number;

  @IsOptional()
  @IsString()
  unidadePorcao?: string;

  @IsOptional()
  ativo?: boolean;
}
