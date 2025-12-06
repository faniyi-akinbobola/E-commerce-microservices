import { Controller, Get, Post, Delete, Patch, Inject, Param, Body, UseGuards, Req } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { UpdateUserDto } from 'common/dtos/update-user.dto';
import { JwtBlacklistGuard } from '../guards/jwt-blacklist.guard';


@UseGuards(JwtBlacklistGuard)
@Controller('users')
export class UsersController {

    constructor(@Inject('AUTH_SERVICE') private readonly authClient: ClientProxy) {}


    @Get('getusers')
    getUsers(){
        return this.authClient.send({cmd: 'get_users' }, {})
    }

    @Get('getuser/:id')
    getUserById(@Param('id') id:string){
        return this.authClient.send({cmd:'get_user_by_id'}, {id})
    }

    @Delete('deleteuser')
    deleteUser(@Req() req) {
        const jwtToken = req.headers['authorization']?.replace('Bearer ', '');
        return this.authClient.send({ cmd: 'delete_user' }, { id: req.user.id, requesterId: req.user.id, token: jwtToken });
    }

    @Patch('updateuser')
    updateUser(@Body() updateUserDto: UpdateUserDto, @Req() req) {
        return this.authClient.send({ cmd: 'update_user' }, { id: req.user.id, requesterId: req.user.id, updateUserDto });
    }

}
