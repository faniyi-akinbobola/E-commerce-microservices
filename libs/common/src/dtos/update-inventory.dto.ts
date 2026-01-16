import { PartialType } from '@nestjs/swagger';
import { CreateInventoryDto } from './create-inventory.dto';
import { IsNumber, IsBoolean, IsOptional, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateInventoryDto extends PartialType(CreateInventoryDto) {
  @ApiPropertyOptional({
    description: 'Updated inventory quantity',
    example: 150,
    minimum: 0,
    type: Number,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  quantity?: number;

  @ApiPropertyOptional({
    description: 'Whether the inventory is active',
    example: true,
    type: Boolean,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
