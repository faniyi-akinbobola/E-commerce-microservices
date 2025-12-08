import { IsNotEmpty, IsNumber, IsString } from "class-validator";


export class CreateProductDto {
    @IsString()
    @IsNotEmpty()
    name : string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsNotEmpty()
    @IsNumber()
    price: number;

    @IsNotEmpty()
    @IsNumber()
    stock: number;

    @IsNotEmpty({ each: true })
    categoryIds: string[];

    @IsString()
    brand?: string;
}