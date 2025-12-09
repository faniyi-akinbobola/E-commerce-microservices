import { IsNumber, IsString, Min } from 'class-validator';

export class ReserveStockDto {
  @IsString()
  productId: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsString()
  orderId: string;
}
