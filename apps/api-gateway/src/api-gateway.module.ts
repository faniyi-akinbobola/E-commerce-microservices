import { Module } from '@nestjs/common';
import { AuthController } from './auth/auth.controller';
import { CartController } from './cart/cart.controller';
import { InventoryController } from './inventory/inventory.controller';
import { OrderController } from './order/order.controller';
import { ProductController } from './product/product.controller';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import {
  HttpExceptionFilter,
  TimeoutInterceptor,
  TrimPipe,
  ResponseInterceptor,
  QUEUES,
  CircuitBreakerModule
} from '@apps/common';
import { UsersController } from './users/users.controller';
import { UsersAddressController } from './users-address/users-address.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategy/jwt.strategy';
import { JwtBlacklistGuard } from './guards/jwt-blacklist.guard';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [ 
    CircuitBreakerModule,
    ThrottlerModule.forRoot([{
      ttl: 60000, // 60 seconds in milliseconds
      limit: 10,
    }]),
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
    OrderController,
    ProductController,
    UsersController,
    UsersAddressController,
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
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class ApiGatewayModule {}
