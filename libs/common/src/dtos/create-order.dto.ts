import {
  IsArray,
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsDefined,
  ValidateNested,
  IsNotEmptyObject,
} from 'class-validator';
import { CreateChargeDto } from './create-charge.dto';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOrderDto {
  @ApiPropertyOptional({
    description: 'User ID (automatically set from JWT token)',
    example: '123456',
    type: String,
  })
  @IsString()
  @IsOptional()
  userId?: string; // Optional, will be set from JWT

  @ApiPropertyOptional({
    description: 'Order items (automatically fetched from cart if not provided)',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        productId: { type: 'string', example: 'prod_123' },
        quantity: { type: 'number', example: 2 },
      },
    },
  })
  @IsArray()
  @IsOptional()
  items?: {
    productId: string;
    quantity: number;
  }[]; // Optional, can be fetched from cart

  @ApiProperty({
    description: 'Shipping address ID from user addresses',
    example: 'addr_123456',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  shippingAddressId: string;

  @ApiProperty({
    description: 'Stripe payment charge details',
    type: CreateChargeDto,
  })
  @IsDefined()
  @ValidateNested()
  @IsNotEmptyObject()
  @Type(() => CreateChargeDto)
  charge: CreateChargeDto;
}
