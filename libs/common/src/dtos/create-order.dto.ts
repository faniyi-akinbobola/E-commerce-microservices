import { IsArray, IsNotEmpty, IsString, IsNumber, IsOptional, IsDefined, ValidateNested, IsNotEmptyObject } from 'class-validator';
import { CreateChargeDto } from './create-charge.dto';
import { Type } from 'class-transformer';

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


  @IsDefined()
  @ValidateNested()
  @IsNotEmptyObject()
  @Type(()=> CreateChargeDto)
  charge: CreateChargeDto;;
}
