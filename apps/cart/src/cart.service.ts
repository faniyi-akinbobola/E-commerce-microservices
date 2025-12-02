import { InjectRedis } from '@nestjs-modules/ioredis/dist/redis.decorators';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class CartService {

  constructor(@InjectRedis() private readonly redis) {}

  getHello(): string {
    return 'Hello World!';
  }
}
