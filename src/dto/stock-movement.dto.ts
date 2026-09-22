import { IsString, IsNotEmpty, IsOptional, IsNumber, IsDateString, IsIn } from 'class-validator';

export class CreateStockMovementDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsString()
  @IsNotEmpty()
  productName: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['entry', 'exit'])
  movementType: string;

  @IsNumber()
  quantity: number;

  @IsNumber()
  @IsOptional()
  weightGrams?: number;

  @IsString()
  @IsOptional()
  @IsIn(['raw', 'portioned'])
  itemType?: string;

  @IsString()
  @IsOptional()
  reason?: string;

  @IsDateString()
  date: string;
}

export class UpdateStockMovementDto {
  @IsString()
  @IsOptional()
  @IsIn(['entry', 'exit'])
  movementType?: string;

  @IsNumber()
  @IsOptional()
  quantity?: number;

  @IsNumber()
  @IsOptional()
  weightGrams?: number;

  @IsString()
  @IsOptional()
  reason?: string;
}
