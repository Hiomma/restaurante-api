import { IsOptional, IsString, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationDto {
  @IsNumber()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @IsNumber()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  limit?: number = 50;
}
