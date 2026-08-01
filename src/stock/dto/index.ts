import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateStockItemDto {
  @IsString()
  productId: string;

  @IsNumber()
  @Min(0)
  quantidade: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  quantidadeMinima?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  quantidadeMaxima?: number;

  @IsOptional()
  @IsString()
  unidade?: string;

  @IsOptional()
  ativo?: boolean;
}

export class UpdateStockItemDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  quantidade?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  quantidadeMinima?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  quantidadeMaxima?: number;

  @IsOptional()
  @IsString()
  unidade?: string;

  @IsOptional()
  ativo?: boolean;
}
