import { IsString, IsNotEmpty, IsOptional, IsDateString } from 'class-validator';

export class CreateAgendaItemDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsDateString()
  datePerformed: string;

  @IsDateString()
  expiryDate: string;

  @IsString()
  @IsOptional()
  observations?: string;
}

export class UpdateAgendaItemDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsDateString()
  @IsOptional()
  datePerformed?: string;

  @IsDateString()
  @IsOptional()
  expiryDate?: string;

  @IsString()
  @IsOptional()
  observations?: string;
}
