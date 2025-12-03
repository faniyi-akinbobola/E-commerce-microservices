import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { UsersAddressModule } from './users-address/users-address.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/entities/user.entity';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [DatabaseModule, UsersModule, UsersAddressModule,
    TypeOrmModule.forFeature([User]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'defaultSecret',
      signOptions: { expiresIn: '1h' },
    }) 
  ],
  controllers: [AuthController],
  providers: [AuthService]
})
export class AuthModule {}
