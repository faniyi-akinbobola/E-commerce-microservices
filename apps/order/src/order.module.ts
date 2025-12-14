import { Module, OnModuleInit, Inject } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { DatabaseModule } from './database/database.module';
import { ClientsModule, Transport, ClientProxy } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { QUEUES, CircuitBreakerModule } from '@apps/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderItem } from './entities/order-item.entity';
import { Order } from './entities/order-entity';
import * as joi from 'joi';

@Module({
  imports: [
    CircuitBreakerModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/order/.env',
      validationSchema: joi.object({
        RABBITMQ_URL: joi.string().required(),
      }),
    })
    ,DatabaseModule,
        ClientsModule.registerAsync([
      {
        name: 'NOTIFICATION_SERVICE',
        useFactory: (config: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [config.get<string>('RABBITMQ_URL')],
            queue: QUEUES.NOTIFICATIONS_QUEUE,
            queueOptions: { durable: true },
          },
        }),
        inject: [ConfigService],
        imports: [ConfigModule],
      },
      {
        name: 'AUTH_SERVICE',
        useFactory: (config: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [config.get<string>('RABBITMQ_URL')],
            queue: QUEUES.AUTH_QUEUE,
            queueOptions: { durable: true },
          },
        }),
        inject: [ConfigService],
        imports: [ConfigModule],
      },
      {
        name: 'CART_SERVICE',
        useFactory: (config: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [config.get<string>('RABBITMQ_URL')],
            queue: QUEUES.CART_QUEUE,
            queueOptions: { durable: true },
          },
        }),
        inject: [ConfigService],
        imports: [ConfigModule],
      },
      {
        name: 'PRODUCT_SERVICE',
        useFactory: (config: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [config.get<string>('RABBITMQ_URL')],
            queue: QUEUES.PRODUCT_QUEUE,
            queueOptions: { durable: true },
          },
        }),
        inject: [ConfigService],
        imports: [ConfigModule],
      },
      {
        name: 'PAYMENT_SERVICE',
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
    ]),
    TypeOrmModule.forFeature([OrderItem, Order])
  ],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule implements OnModuleInit {
  constructor(
    @Inject('AUTH_SERVICE') private authClient: ClientProxy,
    @Inject('CART_SERVICE') private cartClient: ClientProxy,
    @Inject('PRODUCT_SERVICE') private productClient: ClientProxy,
    @Inject('NOTIFICATION_SERVICE') private notificationClient: ClientProxy,
    @Inject('PAYMENT_SERVICE') private paymentClient: ClientProxy,
  ) {}

  async onModuleInit() {
    try {
      console.log('[OrderModule] Connecting client proxies...');
      await Promise.all([
        this.authClient.connect(),
        this.cartClient.connect(),
        this.productClient.connect(),
        this.notificationClient.connect(),
        this.paymentClient.connect(),
      ]);
      console.log('[OrderModule] ✅ All client proxies connected successfully');
    } catch (error) {
      console.error('[OrderModule] ❌ Failed to connect client proxies:', error.message);
      throw error;
    }
  }
}
