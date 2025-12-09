import { Controller, Delete, Get, Patch, Post,Body, Param, Req, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { UpdateUserAddressDto, CreateUserAddressDto, Roles } from '@apps/common';
import { JwtBlacklistGuard } from '../guards/jwt-blacklist.guard';


@UseGuards(JwtBlacklistGuard)
@Controller('users-address')
export class UsersAddressController {

    constructor(@Inject('AUTH_SERVICE') private readonly authClient: ClientProxy) {}

   @Roles('ADMIN', 'CUSTOMER')
    @Post('createuseraddress')
    createUserAddress(@Body() createUserAddressDto: CreateUserAddressDto, @Req() req) {
        return this.authClient.send({ cmd: 'create_user_address' }, {...createUserAddressDto, userId: req.user.id });
    }

    @Roles('ADMIN', 'CUSTOMER')
    @Get('getuseraddresses')
    getUserAddresses(@Req() req) {
        return this.authClient.send({ cmd: 'get_user_addresses' }, { userId: req.user.id });
    }

    @Roles('ADMIN', 'CUSTOMER')
    @Patch('updateuseraddress/:id')
    updateUserAddress(
    @Param('id') id: string,
    @Body() updateUserAddressDto: UpdateUserAddressDto,
    @Req() req
    ) {
    return this.authClient.send(
        { cmd: 'update_user_address' },
        { id, updateUserAddressDto, userId: req.user.id }
    );
    }

    @Roles('ADMIN', 'CUSTOMER')
    @Delete('deleteuseraddress/:id')
    deleteUserAddress(@Param('id') id: string, @Req() req) {
    return this.authClient.send(
        { cmd: 'delete_user_address' },
        { id, userId: req.user.id }
    );
    }

    @Roles('ADMIN', 'CUSTOMER')
    @Get('getuseraddressbyid/:id')
    getUserAddressById(@Param('id') id: string, @Req() req) {
        return this.authClient.send({ cmd: 'get_user_address_by_id' }, { id, userId: req.user.id });
    }
    
}
