import { NestFactory } from '@nestjs/core';
import { PaymentModule } from './payment.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { QUEUES } from '@apps/common';
import { RpcExceptionFilterMicroservice } from '@apps/common';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(PaymentModule, {
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RabbitMQ_URL || 'amqp://localhost:5672'],
      queue: QUEUES.PAYMENT_QUEUE, //remember to create queue in constants.ts
      queueOptions: {
        durable: false
      },
    },
  });
  app.useGlobalFilters(new RpcExceptionFilterMicroservice());
  await app.listen();
    
  
}
bootstrap();
