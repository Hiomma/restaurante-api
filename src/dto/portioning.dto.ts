import { IsString, IsNotEmpty, IsOptional, IsNumber, IsDateString } from 'class-validator';

export class CreatePortioningDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsString()
  @IsNotEmpty()
  productName: string;

  @IsNumber()
  rawWeightGrams: number;

  @IsNumber()
  cleanWeightGrams: number;

  @IsNumber()
  lossGrams: number;

  @IsNumber()
  @IsOptional()
  lossPercentage?: number;

  @IsNumber()
  @IsOptional()
  portionsCount?: number;

  @IsNumber()
  @IsOptional()
  portionWeightGrams?: number;

  @IsDateString()
  date: string;

  @IsString()
  @IsOptional()
  lote?: string;

  @IsString()
  @IsOptional()
  employeeName?: string;
}

export class UpdatePortioningDto {
  @IsNumber()
  @IsOptional()
  rawWeightGrams?: number;

  @IsNumber()
  @IsOptional()
  cleanWeightGrams?: number;

  @IsNumber()
  @IsOptional()
  lossGrams?: number;

  @IsNumber()
  @IsOptional()
  lossPercentage?: number;

  @IsNumber()
  @IsOptional()
  portionsCount?: number;

  @IsNumber()
  @IsOptional()
  portionWeightGrams?: number;

  @IsString()
  @IsOptional()
  lote?: string;

  @IsString()
  @IsOptional()
  employeeName?: string;
}
