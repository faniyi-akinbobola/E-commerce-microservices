import { IsNumber, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReserveStockDto {
  @ApiProperty({
    description: 'Product ID to reserve stock for',
    example: 'prod_123456',
    type: String,
  })
  @IsString()
  productId: string;

  @ApiProperty({
    description: 'Quantity to reserve',
    example: 5,
    minimum: 1,
    type: Number,
  })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({
    description: 'Order ID associated with the reservation',
    example: 'order_789012',
    type: String,
  })
  @IsString()
  orderId: string;
}
