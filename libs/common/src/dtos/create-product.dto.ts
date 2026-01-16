import { IsNotEmpty, IsNumber, IsString, IsOptional, IsArray, IsMongoId } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({
    description: 'Product name',
    example: 'MacBook Pro 16"',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Product description',
    example: 'Powerful laptop with M3 chip, 16GB RAM, and 512GB SSD',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'Product price in dollars',
    example: 2499.99,
    minimum: 0,
    type: Number,
  })
  @IsNotEmpty()
  @IsNumber()
  price: number;

  @ApiProperty({
    description: 'Initial stock quantity',
    example: 50,
    minimum: 0,
    type: Number,
  })
  @IsNotEmpty()
  @IsNumber()
  stock: number;

  @ApiProperty({
    description: 'Array of category IDs (MongoDB ObjectIds)',
    example: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'],
    type: [String],
  })
  @IsArray()
  @IsMongoId({ each: true })
  @IsNotEmpty({ each: true })
  categoryIds: string[];

  @ApiPropertyOptional({
    description: 'Array of product image URLs',
    example: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiPropertyOptional({
    description: 'Product brand name',
    example: 'Apple',
    type: String,
  })
  @IsOptional()
  @IsString()
  brand?: string;
}
