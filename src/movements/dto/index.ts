import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateStockMovementDto {
  @IsString()
  productId: string;

  @IsEnum(['entrada', 'saida', 'ajuste', 'transferencia'])
  tipo: 'entrada' | 'saida' | 'ajuste' | 'transferencia';

  @IsNumber()
  @Min(0)
  quantidade: number;

  @IsString()
  motivo: string;

  @IsOptional()
  @IsString()
  destino?: string;

  @IsOptional()
  @IsString()
  responsavelId?: string;
}

export class UpdateStockMovementDto {
  @IsOptional()
  @IsEnum(['entrada', 'saida', 'ajuste', 'transferencia'])
  tipo?: 'entrada' | 'saida' | 'ajuste' | 'transferencia';

  @IsOptional()
  @IsNumber()
  @Min(0)
  quantidade?: number;

  @IsOptional()
  @IsString()
  motivo?: string;

  @IsOptional()
  @IsString()
  destino?: string;

  @IsOptional()
  @IsString()
  responsavelId?: string;

  @IsOptional()
  sincronizado?: boolean;
}
