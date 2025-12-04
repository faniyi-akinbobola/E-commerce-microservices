import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { QUEUES } from '@apps/common';

@Module({
  imports: [
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
  controllers: [PaymentController],
  providers: [PaymentService],
})
export class PaymentModule {}
