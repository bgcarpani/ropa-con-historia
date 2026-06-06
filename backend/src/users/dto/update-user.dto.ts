import { IsBoolean, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  creditPercentage?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  cashPercentage?: number;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
