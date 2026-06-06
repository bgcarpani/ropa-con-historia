import { IsEnum } from 'class-validator';
import { ProductState } from '@prisma/client';

export class UpdateProductStateDto {
  @IsEnum(ProductState)
  state: ProductState;
}
