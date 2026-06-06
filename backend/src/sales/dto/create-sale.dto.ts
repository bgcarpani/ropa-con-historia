import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class CreateSaleDto {
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  productIds: string[];
}
