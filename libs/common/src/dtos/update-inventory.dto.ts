import { PartialType } from '@nestjs/mapped-types';
import { CreateInventoryDto } from './create-inventory.dto';
import { IsNumber, IsBoolean, IsOptional, Min } from 'class-validator';

export class UpdateInventoryDto extends PartialType(CreateInventoryDto) {
    @IsOptional()
    @IsNumber()
    @Min(0)
    quantity?: number;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

}