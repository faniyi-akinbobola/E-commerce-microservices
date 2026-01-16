import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddStockDto {
  @ApiProperty({
    description: 'Product ID to add stock for',
    example: 'prod_123456',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({
    description: 'Quantity to add to inventory',
    example: 50,
    minimum: 1,
    type: Number,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  quantity: number; // amount to add
}
