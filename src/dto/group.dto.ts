import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateGroupDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class UpdateGroupDto {
  @IsString()
  @IsOptional()
  name?: string;
}
