import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { UsersAddressModule } from './users-address/users-address.module';

@Module({
  imports: [DatabaseModule, UsersModule, UsersAddressModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
