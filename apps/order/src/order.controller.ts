import { Controller, Get } from '@nestjs/common';
import { OrderService } from './order.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreateOrderDto, UpdateOrderStatusDto, CancelOrderDto, AddPaymentRecordDto } from '@apps/common';

@Controller()
export class OrderController {
  constructor(private readonly orderService: OrderService) {}


  @MessagePattern({ cmd: 'create_order' })
  createOrder(@Payload() data :{userId: string, dto: CreateOrderDto, idempotencyKey: string}) {
    return this.orderService.createOrder(data.userId, data.dto, data.idempotencyKey);
  }

  @MessagePattern({ cmd: 'get_order_by_id' })
  getOrderById(@Payload() orderId: string) {
    return this.orderService.getOrderById(orderId);
  }

  @MessagePattern({ cmd: 'get_all_orders' })
  getAllOrders() {
    return this.orderService.getAllOrders();
  
  }

  @MessagePattern({ cmd: 'get_user_orders' })
  getUserOrders(@Payload() userId: string) {
    return this.orderService.getUserOrders(userId);
  }

  @MessagePattern({ cmd: 'cancel_order' })
  cancelOrder(@Payload() data: {userId:string ,dto: CancelOrderDto, idempotencyKey: string}) {
    return this.orderService.cancelOrder(data.userId, data.dto, data.idempotencyKey);
  }

  @MessagePattern({ cmd: 'update_order_status' })
  updateOrderStatus(@Payload() data: {dto: UpdateOrderStatusDto, idempotencyKey: string}) {
    return this.orderService.updateOrderStatus(data.dto, data.idempotencyKey);
  }

  @MessagePattern({ cmd: 'add_payment_record' })
  addPaymentRecord(@Payload() dto: AddPaymentRecordDto) {
  return this.orderService.addPaymentRecord(dto);
}
}