import { Body, Controller, Inject, Post, OnModuleInit, Logger } from '@nestjs/common';
import { CreateUserDto, LoginDto, QUEUES,RefreshTokenDto, ResetPasswordDto,ForgotPasswordDto, ChangePasswordDto, CircuitBreakerService } from '@apps/common';
import { UseGuards, Get, Request } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { JwtBlacklistGuard } from '../guards/jwt-blacklist.guard';
import { timeout, catchError, throwError, firstValueFrom } from 'rxjs';

@Controller('auth')
export class AuthController implements OnModuleInit {
      private readonly logger = new Logger(AuthController.name);
      
      // Circuit breakers for different auth operations
      private loginCircuit;
      private signupCircuit;
      private refreshTokenCircuit;
      private forgotPasswordCircuit;
      private resetPasswordCircuit;
      private changePasswordCircuit;
      private signOutCircuit;
      private getProfileCircuit;

      constructor(
        @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
        private readonly circuitBreakerService: CircuitBreakerService,
      ) {}

      async onModuleInit() {
        // Retry connection with exponential backoff
        const maxRetries = 10;
        let retries = 0;
        
        while (retries < maxRetries) {
          try {
            await this.authClient.connect();
            this.logger.log('Successfully connected to AUTH_SERVICE via RabbitMQ');
            break; // Success - exit loop
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

        // Initialize circuit breakers after connection
        this.initializeCircuitBreakers();
      }

      private initializeCircuitBreakers() {
        // Login circuit breaker
        this.loginCircuit = this.circuitBreakerService.createCircuitBreaker(
          async (data: LoginDto) => {
            return await firstValueFrom(
              this.authClient.send({ cmd: 'login' }, data).pipe(timeout(5000))
            );
          },
          {
            timeout: 5000,
            errorThresholdPercentage: 50,
            resetTimeout: 30000,
            name: 'auth_login',
          }
        );

        this.loginCircuit.fallback(() => {
          throw new Error('Authentication service is temporarily unavailable. Please try again later.');
        });

        // Signup circuit breaker
        this.signupCircuit = this.circuitBreakerService.createCircuitBreaker(
          async (data: CreateUserDto) => {
            return await firstValueFrom(
              this.authClient.send({ cmd: 'signup' }, data).pipe(timeout(10000))
            );
          },
          {
            timeout: 10000,
            errorThresholdPercentage: 50,
            resetTimeout: 30000,
            name: 'auth_signup',
          }
        );

        this.signupCircuit.fallback(() => {
          throw new Error('Signup service is temporarily unavailable. Please try again later.');
        });

        // Refresh token circuit breaker
        this.refreshTokenCircuit = this.circuitBreakerService.createCircuitBreaker(
          async (data: RefreshTokenDto) => {
            return await firstValueFrom(
              this.authClient.send({ cmd: 'refreshTokens' }, data).pipe(timeout(5000))
            );
          },
          {
            timeout: 5000,
            errorThresholdPercentage: 50,
            resetTimeout: 30000,
            name: 'auth_refresh_token',
          }
        );

        this.refreshTokenCircuit.fallback(() => {
          throw new Error('Token refresh service is temporarily unavailable. Please login again.');
        });

        // Forgot password circuit breaker
        this.forgotPasswordCircuit = this.circuitBreakerService.createCircuitBreaker(
          async (data: ForgotPasswordDto) => {
            return await firstValueFrom(
              this.authClient.send({ cmd: 'forgotPassword' }, data).pipe(timeout(5000))
            );
          },
          {
            timeout: 5000,
            errorThresholdPercentage: 50,
            resetTimeout: 30000,
            name: 'auth_forgot_password',
          }
        );

        this.forgotPasswordCircuit.fallback(() => {
          throw new Error('Password reset service is temporarily unavailable. Please try again later.');
        });

        // Reset password circuit breaker
        this.resetPasswordCircuit = this.circuitBreakerService.createCircuitBreaker(
          async (data: ResetPasswordDto) => {
            return await firstValueFrom(
              this.authClient.send({ cmd: 'resetPassword' }, data).pipe(timeout(5000))
            );
          },
          {
            timeout: 5000,
            errorThresholdPercentage: 50,
            resetTimeout: 30000,
            name: 'auth_reset_password',
          }
        );

        this.resetPasswordCircuit.fallback(() => {
          throw new Error('Password reset service is temporarily unavailable. Please try again later.');
        });

        // Change password circuit breaker
        this.changePasswordCircuit = this.circuitBreakerService.createCircuitBreaker(
          async (data: ChangePasswordDto) => {
            return await firstValueFrom(
              this.authClient.send({ cmd: 'changePassword' }, data).pipe(timeout(5000))
            );
          },
          {
            timeout: 5000,
            errorThresholdPercentage: 50,
            resetTimeout: 30000,
            name: 'auth_change_password',
          }
        );

        this.changePasswordCircuit.fallback(() => {
          throw new Error('Password change service is temporarily unavailable. Please try again later.');
        });

        // Sign out circuit breaker
        this.signOutCircuit = this.circuitBreakerService.createCircuitBreaker(
          async (data: any) => {
            return await firstValueFrom(
              this.authClient.send({ cmd: 'signOut' }, data).pipe(timeout(5000))
            );
          },
          {
            timeout: 5000,
            errorThresholdPercentage: 50,
            resetTimeout: 30000,
            name: 'auth_sign_out',
          }
        );

        this.signOutCircuit.fallback(() => {
          throw new Error('Sign out service is temporarily unavailable. Please try again later.');
        });

        // Get profile circuit breaker
        this.getProfileCircuit = this.circuitBreakerService.createCircuitBreaker(
          async (data: any) => {
            return await firstValueFrom(
              this.authClient.send({ cmd: 'getProfile' }, data).pipe(timeout(5000))
            );
          },
          {
            timeout: 5000,
            errorThresholdPercentage: 50,
            resetTimeout: 30000,
            name: 'auth_get_profile',
          }
        );

        this.getProfileCircuit.fallback(() => {
          throw new Error('Profile service is temporarily unavailable. Please try again later.');
        });

        this.logger.log('All auth circuit breakers initialized');
      }


    @Post('login')
    async login(@Body() loginDto: LoginDto) {
        try {
            return await this.loginCircuit.fire(loginDto);
        } catch (error) {
            this.logger.error(`Login failed: ${error.message}`);
            throw error;
        }
    }

    @Post('signup')
    async signup(@Body() body: CreateUserDto) {
        try {
            this.logger.log(`Signup request for user: ${body.username}`);
            return await this.signupCircuit.fire(body);
        } catch (error) {
            this.logger.error(`Signup failed: ${error.message}`, error.stack);
            throw error;
        }
    }

    @Post('refreshtoken')
    async refreshToken(@Body() body: RefreshTokenDto){
        try {
            return await this.refreshTokenCircuit.fire(body);
        } catch (error) {
            this.logger.error(`Refresh token failed: ${error.message}`);
            throw error;
        }
    }

    @Post('forgotpassword')
    async forgotPassword(@Body() body: ForgotPasswordDto){
        try {
            return await this.forgotPasswordCircuit.fire(body);
        } catch (error) {
            this.logger.error(`Forgot password failed: ${error.message}`);
            throw error;
        }
    }

    @Post('resetpassword')
    async resetPassword(@Body() body: ResetPasswordDto){
        try {
            return await this.resetPasswordCircuit.fire(body);
        } catch (error) {
            this.logger.error(`Reset password failed: ${error.message}`);
            throw error;
        }
    }

    @UseGuards(JwtBlacklistGuard)
    @Post('changepassword')
    async changePassword(@Body() body: ChangePasswordDto, @Request() req){
        try {
            return await this.changePasswordCircuit.fire({ 
                userId: req.user.id, 
                changePasswordDto: body 
            });
        } catch (error) {
            this.logger.error(`Change password failed: ${error.message}`);
            throw error;
        }
    }

    @UseGuards(JwtBlacklistGuard)
    @Post('signout')
    async signOut(@Request() req) {
        try {
            const jwtToken = req.headers['authorization']?.replace('Bearer ', '');
            return await this.signOutCircuit.fire({ 
                userId: req.user.id, 
                token: jwtToken 
            });
        } catch (error) {
            this.logger.error(`Sign out failed: ${error.message}`);
            throw error;
        }
    }

    @UseGuards(JwtBlacklistGuard)
    @Get('getprofile')
    async getProfile(@Request() req) {
        try {
            return await this.getProfileCircuit.fire({ userId: req.user.id });
        } catch (error) {
            this.logger.error(`Get profile failed: ${error.message}`);
            throw error;
        }
    }

}
