import { Body, Controller, Inject, Post } from '@nestjs/common';
import { CreateUserDto, LoginDto, QUEUES,RefreshTokenDto, ResetPasswordDto,ForgotPasswordDto, ChangePasswordDto } from '@apps/common';
import { UseGuards, Get, Request } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { JwtAuthGuard } from '@apps/common';

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

    @Post('refreshtoken')
    refreshToken(@Body() body: RefreshTokenDto){
        return this.authClient.send({cmd: 'refreshTokens' },body)
    }

    @Post('forgotpassword')
    forgotPassword(@Body() body: ForgotPasswordDto){
        return this.authClient.send({cmd: 'forgotPassword' },body)
    }

    @Post('resetpassword')
    resetPassword(@Body() body: ResetPasswordDto){
        return this.authClient.send({cmd: 'resetPassword' },body)
    }

    @UseGuards(JwtAuthGuard)
    @Post('changepassword')
    changePassword(@Body() body: ChangePasswordDto, @Request() req){
        return this.authClient.send({cmd: 'changePassword' }, { userId: req.user.id, changePasswordDto: body })
    }

    @UseGuards(JwtAuthGuard)
    @Post('signout')
    signOut(@Request() req) {
        return this.authClient.send({cmd: 'signOut' }, { userId: req.user.id })
    }

    @UseGuards(JwtAuthGuard)
    @Get('getprofile')
    getProfile(@Request() req) {
        return this.authClient.send({ cmd: 'getProfile' }, { userId: req.user.id });
    }

}
