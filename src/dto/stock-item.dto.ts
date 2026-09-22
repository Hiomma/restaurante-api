import { IsString, IsNotEmpty, IsOptional, IsNumber, IsDateString, IsIn } from 'class-validator';

export class CreateStockItemDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsString()
  @IsNotEmpty()
  productName: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['raw', 'portioned'])
  type: string;

  @IsNumber()
  weightGrams: number;

  @IsDateString()
  manipulationDate: string;

  @IsDateString()
  expiryDate: string;

  @IsDateString()
  @IsOptional()
  originalExpiryDate?: string;

  @IsString()
  @IsOptional()
  lote?: string;

  @IsString()
  @IsOptional()
  nf?: string;

  @IsString()
  @IsOptional()
  employeeName?: string;

  @IsString()
  @IsOptional()
  productGroup?: string;

  @IsString()
  @IsOptional()
  productStorage?: string;
}

export class UpdateStockItemDto {
  @IsNumber()
  @IsOptional()
  weightGrams?: number;

  @IsDateString()
  @IsOptional()
  expiryDate?: string;

  @IsString()
  @IsOptional()
  @IsIn(['in_stock', 'used', 'discarded', 'expired'])
  status?: string;

  @IsString()
  @IsOptional()
  employeeName?: string;
}

export class StockItemQueryDto {
  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  productId?: string;

  @IsString()
  @IsOptional()
  type?: string;
}
