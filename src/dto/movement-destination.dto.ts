import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsIn } from 'class-validator';

export class CreateMovementDestinationDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  @IsIn(['move', 'writeoff'])
  type?: string;
}

export class UpdateMovementDestinationDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  @IsIn(['move', 'writeoff'])
  type?: string;

  @IsBoolean()
  @IsOptional()
  active?: boolean;
}
