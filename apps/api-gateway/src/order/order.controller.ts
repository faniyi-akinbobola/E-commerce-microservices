import { Controller, Post, Get, Patch, Body, Param, Inject, UseGuards, Req } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreateOrderDto, UpdateOrderStatusDto, CancelOrderDto, AddPaymentRecordDto } from '@apps/common';
import { lastValueFrom } from 'rxjs';
import { JwtBlacklistGuard } from '../guards/jwt-blacklist.guard';

@Controller('orders')
@UseGuards(JwtBlacklistGuard)
export class OrderController {
  constructor(
    @Inject('ORDER_SERVICE') private readonly orderClient: ClientProxy,
  ) {}

  @Post()
  async createOrder(@Req() req, @Body() createOrderDto: CreateOrderDto) {
    const userId = req.user.userId;
    return lastValueFrom(
      this.orderClient.send({ cmd: 'create_order' }, { userId, dto: createOrderDto })
    );
  }

  @Get()
  async getUserOrders(@Req() req) {
    const userId = req.user.userId;
    return lastValueFrom(
      this.orderClient.send({ cmd: 'get_user_orders' }, userId)
    );
  }

  @Get('all')
  async getAllOrders() {
    return lastValueFrom(
      this.orderClient.send({ cmd: 'get_all_orders' }, {})
    );
  }

  @Get(':id')
  async getOrderById(@Param('id') id: string) {
    return lastValueFrom(
      this.orderClient.send({ cmd: 'get_order_by_id' }, id)
    );
  }

  @Patch(':id/cancel')
  async cancelOrder(@Req() req, @Param('id') orderId: string) {
    const userId = req.user.userId;
    return lastValueFrom(
      this.orderClient.send({ cmd: 'cancel_order' }, { userId, dto: { orderId, userId } })
    );
  }

  @Patch(':id/status')
  async updateOrderStatus(@Param('id') orderId: string, @Body() updateDto: { status: string }) {
    return lastValueFrom(
      this.orderClient.send({ cmd: 'update_order_status' }, { orderId, status: updateDto.status })
    );
  }

  @Post(':id/payment')
  async addPaymentRecord(@Param('id') orderId: string, @Body() paymentDto: AddPaymentRecordDto) {
    return lastValueFrom(
      this.orderClient.send({ cmd: 'add_payment_record' }, { ...paymentDto, orderId })
    );
  }
}

