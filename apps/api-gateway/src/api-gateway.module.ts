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
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategy/jwt.strategy';
import { JwtBlacklistGuard } from './guards/jwt-blacklist.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET') || 'defaultSecret',
        signOptions: { expiresIn: '1h' },
      }),
    }),
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
            queue: QUEUES.CART_QUEUE, 
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
            queue: QUEUES.INVENTORY_QUEUE, 
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
            queue: QUEUES.ORDER_QUEUE, 
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
            queue: QUEUES.PAYMENT_QUEUE, 
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
            queue: QUEUES.SHIPPING_QUEUE, 
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
    JwtStrategy,
    JwtBlacklistGuard,
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
