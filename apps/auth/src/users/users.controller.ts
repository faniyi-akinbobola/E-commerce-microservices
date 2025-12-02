import { Controller, Delete, Post, Get, Patch } from '@nestjs/common';

@Controller('users')
export class UsersController {

    @Post()
    createUser() {
        return 'User created';
    }

    @Get()
    getUsers() {
        return 'List of users';
    }

    @Patch()
    updateUser() {
        return 'User updated';
    }

    @Delete()
    deleteUser() {
        return 'User deleted';
    }
}
