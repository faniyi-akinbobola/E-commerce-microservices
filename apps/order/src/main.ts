import { NestFactory } from '@nestjs/core';
import { OrderModule } from './order.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { QUEUES } from 'common/constants';
import { RpcExceptionFilterMicroservice } from 'common/filters/rpc-exception.filter';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(OrderModule, {
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
      queue: QUEUES.ORDER_QUEUE, //remember to create queue in constants.ts
      queueOptions: {
        durable: true
      },
    },
  });
  app.useGlobalFilters(new RpcExceptionFilterMicroservice());
  await app.listen();
}
bootstrap();
