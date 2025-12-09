import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class ReduceStockDto {
    @IsString()
    @IsNotEmpty()
    productId: string;
    
    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    quantity: number; // amount to remove
}
