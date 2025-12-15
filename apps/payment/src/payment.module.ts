import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as joi from 'joi';
import { CircuitBreakerModule } from '@apps/common';


@Module({
  imports: [
    CircuitBreakerModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/payment/.env',
      validationSchema: joi.object({
        STRIPE_SECRET_KEY: joi.string().required(),
        RABBITMQ_URL: joi.string().required(),
      })
    })
  ],
  controllers: [PaymentController],
  providers: [PaymentService],
})
export class PaymentModule {}
