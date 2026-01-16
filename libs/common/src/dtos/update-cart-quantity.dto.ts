import { IsNotEmpty, IsString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCartQuantityDto {
  @ApiProperty({
    description: 'Product ID in the cart',
    example: 'prod_123456',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({
    description: 'New quantity for the product',
    example: 3,
    minimum: 1,
    type: Number,
  })
  @IsNumber()
  @IsNotEmpty()
  quantity: number;
}
