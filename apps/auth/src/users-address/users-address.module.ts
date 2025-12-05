import { Module } from '@nestjs/common';
import { UsersAddressController } from './users-address.controller';
import { UsersAddressService } from './users-address.service';
import { DatabaseModule } from '../database/database.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserAddress } from './entities/user-address.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [DatabaseModule, TypeOrmModule.forFeature([UserAddress, User])],
  controllers: [UsersAddressController],
  providers: [UsersAddressService]
})
export class UsersAddressModule {}
