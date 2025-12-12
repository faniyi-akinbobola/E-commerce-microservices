import { IsArray, IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateOrderDto {
  @IsString()
  @IsOptional()
  userId?: string; // Optional, will be set from JWT

  @IsArray()
  @IsOptional()
  items?: {
    productId: string;
    quantity: number;
  }[]; // Optional, can be fetched from cart

  @IsString()
  @IsNotEmpty()
  shippingAddressId: string;
}
