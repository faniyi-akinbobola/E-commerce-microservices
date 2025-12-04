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
  QUEUES
} from '@apps/common';
import { UsersController } from './users/users.controller';
import { UsersAddressController } from './users-address/users-address.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ShippingController } from './shipping/shipping.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
ClientsModule.registerAsync([
      {
        name: 'PRODUCT_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [config.get<string>('RABBITMQ_URL') as string],
            queue: config.get<string>('PRODUCT_QUEUE') as string,  
            queueOptions: { durable: true },
          },
        }),
      },

      {
        name: 'AUTH_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [config.get<string>('RABBITMQ_URL') as string],
            queue: config.get<string>('AUTH_QUEUE') as string, 
            queueOptions: { durable: true },
          },
        }),
      },

      {
        name:'CART_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [config.get<string>('RABBITMQ_URL') as string],
            queue: config.get<string>(QUEUES.CART_QUEUE) as string, 
            queueOptions: { durable: true },
          },
        }),
      },

      {
        name:'INVENTORY_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [config.get<string>('RABBITMQ_URL') as string],
            queue: config.get<string>(QUEUES.INVENTORY_QUEUE) as string, 
            queueOptions: { durable: true },
          },
        }),
      },

      {
        name:'ORDER_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [config.get<string>('RABBITMQ_URL') as string],
            queue: config.get<string>(QUEUES.ORDER_QUEUE) as string, 
            queueOptions: { durable: true },
          },
        }),
      },

      {
        name:'PAYMENT_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [config.get<string>('RABBITMQ_URL') as string],
            queue: config.get<string>(QUEUES.PAYMENT_QUEUE) as string, 
            queueOptions: { durable: true },
          },
        }),
      },

      {
        name:'SHIPPING_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [config.get<string>('RABBITMQ_URL') as string],
            queue: config.get<string>(QUEUES.SHIPPING_QUEUE) as string, 
            queueOptions: { durable: true },
          },
        }),
      }

    ]),
  ],
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
    ShippingController,
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
