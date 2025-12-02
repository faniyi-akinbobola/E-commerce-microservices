import { Module } from '@nestjs/common';
import { UsersAddressController } from './users-address.controller';
import { UsersAddressService } from './users-address.service';

@Module({
  controllers: [UsersAddressController],
  providers: [UsersAddressService]
})
export class UsersAddressModule {}
