import { IsEmail, IsNotEmpty, IsOptional, IsString, Min, Max, IsNumber } from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

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
}
