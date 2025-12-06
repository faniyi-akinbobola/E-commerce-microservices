import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { UsersAddressModule } from './users-address/users-address.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { QUEUES } from '@apps/common';  
import { Blacklist } from './blacklist/blacklist.entity';

@Module({
  imports: [DatabaseModule, UsersModule, UsersAddressModule,
    TypeOrmModule.forFeature([User, Blacklist]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'defaultSecret',
      signOptions: { expiresIn: '1h' },
    }),
    ClientsModule.registerAsync([
  {
    name: 'NOTIFICATION_SERVICE',
    useFactory: (config: ConfigService) => ({
      transport: Transport.RMQ,
      options: {
        urls: [config.get<string>('RABBITMQ_URL')],
        queue: QUEUES.NOTIFICATIONS_QUEUE,
        queueOptions: { durable: true },
      },
    }),
    inject: [ConfigService],
    imports: [ConfigModule],
  },
])
 
  ],
  controllers: [AuthController],
  providers: [AuthService]
})
export class AuthModule {}
