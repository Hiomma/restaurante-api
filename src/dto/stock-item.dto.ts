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

  @IsString()
  @IsOptional()
  batchId?: string;

  @IsString()
  @IsOptional()
  destination?: string;

  @IsString()
  @IsOptional()
  supplier?: string;

  /**
   * QR Code already shown to the user on the label preview. When present it
   * is stored as-is so the printed QR is exactly the one that was previewed
   * (the server only generates one when the client does not send it).
   */
  @IsString()
  @IsOptional()
  qrCode?: string;
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

  @IsString()
  @IsOptional()
  batchId?: string;

  @IsString()
  @IsOptional()
  destination?: string;

  @IsString()
  @IsOptional()
  supplier?: string;
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

  @IsString()
  @IsOptional()
  destination?: string;

  @IsString()
  @IsOptional()
  supplier?: string;
}
