import { NestFactory } from '@nestjs/core';
import { CartModule } from './cart.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { QUEUES } from '@apps/common';
import { RpcExceptionFilterMicroservice } from '@apps/common';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(CartModule, {
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RabbitMQ_URL || 'amqp://localhost:5672'],
      queue: QUEUES.CART_QUEUE,
      queueOptions: {
        durable: true
      },
    },
  });
  app.useGlobalFilters(new RpcExceptionFilterMicroservice());
  await app.listen();
}
bootstrap();
