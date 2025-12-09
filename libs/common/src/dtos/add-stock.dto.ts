import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class AddStockDto {

    @IsString()
    @IsNotEmpty()
    productId: string;

    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    quantity: number; // amount to add
}
