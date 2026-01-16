import { Module } from '@nestjs/common';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisModule } from './redis/redis.module';
import { IdempotencyModule, IdempotencyRequest } from '@apps/common';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/cart/.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get('DB_PORT', 5432),
        username: configService.get('DB_USERNAME', 'postgres'),
        password: configService.get('DB_PASSWORD', 'postgres'),
        database: configService.get('DB_DATABASE', 'cart_db'),
        entities: [IdempotencyRequest],
        synchronize: true, // Set to false in production
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([IdempotencyRequest]),
    RedisModule,
    IdempotencyModule,
  ],
  controllers: [CartController],
  providers: [CartService],
})
export class CartModule {}
