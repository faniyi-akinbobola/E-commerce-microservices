import { NestFactory } from '@nestjs/core';
import { InventoryModule } from './inventory.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { QUEUES, RpcExceptionFilterMicroservice } from '@apps/common';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(InventoryModule, {
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RabbitMQ_URL || 'amqp://localhost:5672'],
      queue: QUEUES.INVENTORY_QUEUE, //remember to create queue in constants.ts
      queueOptions: {
        durable: false
      },
    },
  });
  app.useGlobalFilters(new RpcExceptionFilterMicroservice());
  await app.listen();
}
bootstrap();
