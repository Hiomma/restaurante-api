import { IsString, IsNotEmpty, IsOptional, IsIn, IsNumber } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['Carnes', 'Aves', 'Peixes', 'Frios', 'Laticinios', 'Hortifruti', 'Graos', 'Bebidas', 'Temperos', 'Massas', 'Outros'])
  group: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['Refrigerado', 'Congelado', 'Temperatura Ambiente', 'Camara Fria'])
  storageMethod: string;

  @IsNumber()
  shelfLifeDays: number;

  @IsNumber()
  @IsOptional()
  minQuantity?: number;

  @IsNumber()
  @IsOptional()
  minPortionedQuantity?: number;

  @IsNumber()
  @IsOptional()
  consumeAfterOpeningDays?: number;
}

export class UpdateProductDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  @IsIn(['Carnes', 'Aves', 'Peixes', 'Frios', 'Laticinios', 'Hortifruti', 'Graos', 'Bebidas', 'Temperos', 'Massas', 'Outros'])
  group?: string;

  @IsString()
  @IsOptional()
  @IsIn(['Refrigerado', 'Congelado', 'Temperatura Ambiente', 'Camara Fria'])
  storageMethod?: string;

  @IsNumber()
  @IsOptional()
  shelfLifeDays?: number;

  @IsNumber()
  @IsOptional()
  minQuantity?: number;

  @IsNumber()
  @IsOptional()
  minPortionedQuantity?: number;

  @IsNumber()
  @IsOptional()
  consumeAfterOpeningDays?: number;
}
