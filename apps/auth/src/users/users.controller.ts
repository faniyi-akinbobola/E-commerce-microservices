import { Controller, Delete, Post, Get, Patch, Body, Param, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from 'common/dtos';
import { MessagePattern } from '@nestjs/microservices';

@Controller('users')
export class UsersController {

    constructor(private readonly usersService: UsersService) {}

    @MessagePattern({cmd:'create_user'})
    createUser(createUserDto : CreateUserDto) {
        return this.usersService.createUser(createUserDto);
    }

    @MessagePattern({ cmd: 'get_users' })
    getUsers() {
        return this.usersService.getUsers();
    }

    @MessagePattern({ cmd: 'update_user' })
    updateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
        return this.usersService.updateUser(id, updateUserDto);
    }

    @MessagePattern({ cmd: 'delete_user' })
    deleteUser(@Param('id') id: string) {
        return this.usersService.deleteUser(id);
    }
}
