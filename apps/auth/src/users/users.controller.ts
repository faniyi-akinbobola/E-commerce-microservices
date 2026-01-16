import { Controller, Delete, Post, Get, Patch, Body, Param, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from 'common/dtos';
import { MessagePattern } from '@nestjs/microservices';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  createUser(createUserDto: CreateUserDto) {
    return this.usersService.createUser(createUserDto);
  }

  @MessagePattern({ cmd: 'get_users' })
  getUsers() {
    return this.usersService.getUsers();
  }

  @MessagePattern({ cmd: 'update_user' })
  updateUser(data: { id: string; requesterId: string; updateUserDto: UpdateUserDto }) {
    return this.usersService.updateUser(data.id, data.requesterId, data.updateUserDto);
  }

  @MessagePattern({ cmd: 'delete_user' })
  deleteUser(data: { id: string; requesterId: string; token?: string }) {
    return this.usersService.deleteUser(data.id, data.requesterId, data.token);
  }

  @MessagePattern({ cmd: 'delete_user_by_admin' })
  deleteUserByAdmin(data: { id: string; requesterId: string; token?: string }) {
    return this.usersService.deleteUserByAdmin(data.id, data.requesterId, data.token);
  }

  @MessagePattern({ cmd: 'get_user_by_id' })
  getUserById(data: { id: string }) {
    return this.usersService.getUserById(data.id);
  }
}
