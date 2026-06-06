import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ReturnState } from '@prisma/client';

export class UpdateReturnStateDto {
  @IsEnum(ReturnState)
  state: ReturnState;

  @IsOptional()
  @IsString()
  adminNote?: string;
}
