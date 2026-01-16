import { IsNumber, IsString, Min, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ReleaseStockDto {
  @ApiProperty({
    description: 'Product ID to release stock for',
    example: 'prod_123456',
    type: String,
  })
  @IsString()
  productId: string;

  @ApiProperty({
    description: 'Quantity to release back to available stock',
    example: 3,
    minimum: 1,
    type: Number,
  })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiPropertyOptional({
    description: 'Optional order ID associated with the release',
    example: 'order_789012',
    type: String,
  })
  @IsOptional()
  @IsString()
  orderId?: string;
}
