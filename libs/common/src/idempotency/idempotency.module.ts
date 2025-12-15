import { Module } from '@nestjs/common';
import { IdempotencyService } from './idempotency.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IdempotencyRequest } from '../entities/idempotency-request.entity';

@Module({
  imports: [TypeOrmModule.forFeature([IdempotencyRequest])],
  providers: [IdempotencyService],
  exports: [IdempotencyService]
})
export class IdempotencyModule {}
