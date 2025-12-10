import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class UpdateCartQuantityDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsNumber()
  @IsNotEmpty()
  quantity: number;
}
