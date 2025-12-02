import { Module } from '@nestjs/common';
import { AuthController } from './auth/auth.controller';
import { CartController } from './cart/cart.controller';
import { InventoryController } from './inventory/inventory.controller';
import { NotificationsController } from './notifications/notifications.controller';
import { OrderController } from './order/order.controller';
import { PaymentController } from './payment/payment.controller';
import { ProductController } from './product/product.controller';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import {
  HttpExceptionFilter,
  TimeoutInterceptor,
  TrimPipe,
  ResponseInterceptor,
} from '@apps/common';
import { UsersController } from './users/users.controller';
import { UsersAddressController } from './users-address/users-address.controller';

@Module({
  imports: [],
  controllers: [
    AuthController,
    CartController,
    InventoryController,
    NotificationsController,
    OrderController,
    PaymentController,
    ProductController,
    UsersController,
    UsersAddressController,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TimeoutInterceptor,
    },
    {
      provide: APP_PIPE,
      useClass: TrimPipe,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
  ],
})
export class ApiGatewayModule {}
