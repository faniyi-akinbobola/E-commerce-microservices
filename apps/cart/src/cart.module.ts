import { Module } from '@nestjs/common';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';

import { RedisModule } from './redis/redis.module';
import { IdempotencyModule } from '@apps/common';

@Module({
  imports: [
    RedisModule,
    IdempotencyModule,
  ],
  controllers: [CartController],
  providers: [CartService],
})
export class CartModule {}
