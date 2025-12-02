import { NestFactory } from '@nestjs/core';
import { NotificationsModule } from './notifications.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { QUEUES, RpcExceptionFilterMicroservice } from '@apps/common';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(NotificationsModule, {
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RabbitMQ_URL || 'amqp://localhost:5672'],
      queue: QUEUES.NOTIFICATIONS_QUEUE, //remember to create queue in constants.ts
      queueOptions: {
        durable: false
      },
    },
  });
  app.useGlobalFilters(new RpcExceptionFilterMicroservice());
  await app.listen();
}
bootstrap();
