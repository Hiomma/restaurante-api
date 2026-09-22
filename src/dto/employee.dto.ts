import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsIn } from 'class-validator';

export class CreateEmployeeDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsOptional()
  @IsIn(['employee', 'admin'])
  role?: string;
}

export class UpdateEmployeeDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  username?: string;

  @IsString()
  @IsOptional()
  password?: string;

  @IsString()
  @IsOptional()
  @IsIn(['employee', 'admin'])
  role?: string;

  @IsBoolean()
  @IsOptional()
  active?: boolean;
}
