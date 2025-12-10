import { Module } from '@nestjs/common';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { ConfigModule } from '@nestjs/config';
import { ConfigService } from '@nestjs/config';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [
    RedisModule
  ],
  controllers: [CartController],
  providers: [CartService],
})
export class CartModule {}
