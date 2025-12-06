import { Body, Controller, Inject, Post, OnModuleInit, Logger } from '@nestjs/common';
import { CreateUserDto, LoginDto, QUEUES,RefreshTokenDto, ResetPasswordDto,ForgotPasswordDto, ChangePasswordDto } from '@apps/common';
import { UseGuards, Get, Request } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { JwtBlacklistGuard } from '../guards/jwt-blacklist.guard';
import { timeout, catchError, throwError } from 'rxjs';

@Controller('auth')
export class AuthController implements OnModuleInit {
      private readonly logger = new Logger(AuthController.name);

      constructor(@Inject('AUTH_SERVICE') private readonly authClient: ClientProxy) {}

      async onModuleInit() {
        // Retry connection with exponential backoff
        const maxRetries = 10;
        let retries = 0;
        
        while (retries < maxRetries) {
          try {
            await this.authClient.connect();
            this.logger.log('Successfully connected to AUTH_SERVICE via RabbitMQ');
            return; // Success - exit
          } catch (error) {
            retries++;
            const delay = Math.min(1000 * Math.pow(2, retries), 10000); // Max 10 seconds
            this.logger.warn(`Failed to connect to AUTH_SERVICE (attempt ${retries}/${maxRetries}). Retrying in ${delay}ms...`);
            
            if (retries >= maxRetries) {
              this.logger.error('Failed to connect to AUTH_SERVICE after max retries', error);
              throw error;
            }
            
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      }


    @Post('login')
    login(@Body() loginDto: LoginDto) {
        return this.authClient.send({ cmd: 'login' }, loginDto);
    }

    @Post('signup')
    signup(@Body() body: CreateUserDto) {
        this.logger.log(`Signup request for user: ${body.username}`);
        return this.authClient.send({ cmd: 'signup' }, body).pipe(
          timeout(10000),
          catchError(err => {
            this.logger.error(`Signup failed: ${err.message}`, err.stack);
            return throwError(() => err);
          })
        );
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

    @UseGuards(JwtBlacklistGuard)
    @Post('changepassword')
    changePassword(@Body() body: ChangePasswordDto, @Request() req){
        return this.authClient.send({cmd: 'changePassword' }, { userId: req.user.id, changePasswordDto: body })
    }

    @UseGuards(JwtBlacklistGuard)
    @Post('signout')
    signOut(@Request() req) {
        const jwtToken = req.headers['authorization']?.replace('Bearer ', '');

        return this.authClient.send({cmd: 'signOut' }, { userId: req.user.id, token: jwtToken });
    }

    @UseGuards(JwtBlacklistGuard)
    @Get('getprofile')
    getProfile(@Request() req) {
        return this.authClient.send({ cmd: 'getProfile' }, { userId: req.user.id });
    }

}
