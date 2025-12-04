import { Body, Controller, Inject, Post } from '@nestjs/common';
import { CreateUserDto, LoginDto, QUEUES } from '@apps/common';
import { UseGuards, Get, Request } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Controller('auth')
export class AuthController {

      constructor(@Inject('AUTH_SERVICE') private readonly authClient: ClientProxy) {}


    @Post('login')
    login(@Body() loginDto: LoginDto) {
        return this.authClient.send({ cmd: 'login' }, loginDto);
    }

    @Post('signup')
    signup(@Body() body: CreateUserDto) {
        return this.authClient.send({ cmd: 'signup' }, body);
    }

    // @UseGuards(JwtAuthGuard)
    // @Get('profile')
    // getProfile(@Request() req) {
    // // req.user.userId is set by JwtStrategy's validate method
    // return this.authClient.getProfile(req.user.userId);
    // }
}
