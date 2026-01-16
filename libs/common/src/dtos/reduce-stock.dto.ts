import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReduceStockDto {
  @ApiProperty({
    description: 'Product ID to reduce stock from',
    example: 'prod_123456',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({
    description: 'Quantity to reduce from inventory',
    example: 10,
    minimum: 1,
    type: Number,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  quantity: number; // amount to remove
}
