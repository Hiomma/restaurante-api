import { IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateAgendaItemDto {
  @IsString()
  titulo: string;

  @IsOptional()
  descricao?: string;

  @IsString()
  data: string;

  @IsOptional()
  @IsEnum(['pendente','concluido','cancelado'])
  status?: 'pendente' | 'concluido' | 'cancelado';

  @IsOptional()
  responsavelId?: string;
}

export class UpdateAgendaItemDto {
  @IsOptional()
  @IsString()
  titulo?: string;

  @IsOptional()
  descricao?: string;

  @IsOptional()
  data?: string;

  @IsOptional()
  @IsEnum(['pendente','concluido','cancelado'])
  status?: 'pendente' | 'concluido' | 'cancelado';

  @IsOptional()
  responsavelId?: string;
}
