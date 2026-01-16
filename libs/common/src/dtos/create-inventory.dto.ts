import { IsBoolean, IsDate, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateInventoryDto {
  @ApiProperty({
    description: 'Product ID to create inventory for',
    example: 'prod_123456',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({
    description: 'Initial inventory quantity',
    example: 100,
    minimum: 0,
    type: Number,
  })
  @IsNumber()
  @IsNotEmpty()
  quantity: number;
}
