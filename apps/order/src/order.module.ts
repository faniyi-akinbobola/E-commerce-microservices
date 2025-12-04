import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { DatabaseModule } from './database/database.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { QUEUES } from '@apps/common';

@Module({
  imports: [DatabaseModule,
        ClientsModule.registerAsync([
      {
        name: 'NOTIFICATION_SERVICE',
        useFactory: (config: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [config.get<string>('RABBITMQ_URL')],
            queue: config.get<string>(QUEUES.NOTIFICATIONS_QUEUE),
            queueOptions: { durable: true },
          },
        }),
        inject: [ConfigService],
        imports: [ConfigModule],
      },
    ])
  ],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
