import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreateMovementDestinationDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class UpdateMovementDestinationDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsBoolean()
  @IsOptional()
  active?: boolean;
}
