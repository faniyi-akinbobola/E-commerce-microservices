import { IsNumber, IsString, Min, IsOptional } from 'class-validator';

export class ReleaseStockDto {
  @IsString()
  productId: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsOptional()
  @IsString()
  orderId?: string;
}
