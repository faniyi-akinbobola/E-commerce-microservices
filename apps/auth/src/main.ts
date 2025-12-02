import { NestFactory } from '@nestjs/core';
import { AuthModule } from './auth.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { QUEUES, RpcExceptionFilterMicroservice } from '@apps/common';  

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AuthModule, {
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RabbitMQ_URL || 'amqp://localhost:5672'],
      queue: QUEUES.AUTH_QUEUE, //remember to create queue in constants.ts
      queueOptions: {
        durable: false
      },
    },
  });
  app.useGlobalFilters(new RpcExceptionFilterMicroservice());
  await app.listen();
}
bootstrap();
