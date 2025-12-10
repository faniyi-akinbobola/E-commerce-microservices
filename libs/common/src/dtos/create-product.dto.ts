import { IsNotEmpty, IsNumber, IsString, IsOptional, IsArray, IsMongoId } from "class-validator";


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

    @IsArray()
    @IsMongoId({ each: true })
    @IsNotEmpty({ each: true })
    categoryIds: string[];

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    images?: string[];

    @IsOptional()
    @IsString()
    brand?: string;
}