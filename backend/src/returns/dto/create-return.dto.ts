import { IsNotEmpty, IsString } from 'class-validator';

export class CreateReturnDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsString()
  @IsNotEmpty()
  reason: string;
}
