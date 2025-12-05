import { Controller } from '@nestjs/common';
import { UsersAddressService } from './users-address.service';
import { MessagePattern } from '@nestjs/microservices';
import { CreateUserAddressDto, UpdateUserAddressDto } from 'common/dtos';
import { Payload } from '@nestjs/microservices/decorators';

@Controller('users-address')
export class UsersAddressController {
    constructor(private readonly usersAddressService: UsersAddressService) {}

  @MessagePattern({ cmd: 'create_user_address' })
  createUserAddress(@Payload() data: { userId: string } & CreateUserAddressDto) {
    const { userId, ...dto } = data;
    return this.usersAddressService.createUserAddress(userId, dto);
  }

  @MessagePattern({ cmd: 'get_user_addresses' })
  getUserAddresses(@Payload() data: { userId: string }) {
    return this.usersAddressService.findAll(data.userId);
  }

  @MessagePattern({ cmd: 'update_user_address' })
  updateUserAddress(
    @Payload() data: { id: string; userId: string; updateUserAddressDto: UpdateUserAddressDto }
  ) {
    const { id, userId, updateUserAddressDto } = data;
    return this.usersAddressService.update(id, userId, updateUserAddressDto);
  }

  @MessagePattern({ cmd: 'delete_user_address' })
  deleteUserAddress(@Payload() data: { id: string; userId: string }) {
    return this.usersAddressService.delete(data.id, data.userId);
  }

  @MessagePattern({ cmd: 'get_user_address_by_id' })
  getUserAddressById(@Payload() data: { id: string; userId: string }) {
    return this.usersAddressService.findOne(data.id, data.userId);
  }

}
