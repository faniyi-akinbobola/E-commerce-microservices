import { IsBoolean, IsDate, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateInventoryDto {

    @IsString()
    @IsNotEmpty()
    productId: string;

    @IsNumber()
    @IsNotEmpty()
    quantity: number;

}