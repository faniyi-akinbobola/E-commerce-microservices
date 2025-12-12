import { IsEnum, IsString } from 'class-validator';
import { OrderStatus } from '../../../../apps/order/src/entities/order-entity';

export class UpdateOrderStatusDto {
  @IsString()
  orderId: string;

  @IsEnum(OrderStatus)
  status: OrderStatus;
}
