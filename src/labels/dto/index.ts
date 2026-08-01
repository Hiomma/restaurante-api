import { IsBoolean, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateLabelDto {
  @IsString()
  nome: string;

  @IsNumber()
  @Min(0)
  preco: number;

  @IsOptional()
  ativo?: boolean;
}

export class UpdateLabelDto {
  @IsOptional()
  @IsString()
  nome?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  preco?: number;

  @IsOptional()
  ativo?: boolean;
}
