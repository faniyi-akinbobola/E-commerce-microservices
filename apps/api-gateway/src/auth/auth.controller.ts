import {
  Body,
  Controller,
  Inject,
  Post,
  OnModuleInit,
  Logger,
  UseInterceptors,
} from '@nestjs/common';
import {
  CreateUserDto,
  LoginDto,
  QUEUES,
  RefreshTokenDto,
  ResetPasswordDto,
  ForgotPasswordDto,
  ChangePasswordDto,
  CircuitBreakerService,
} from '@apps/common';
import { UseGuards, Get, Request } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { JwtBlacklistGuard } from '../guards/jwt-blacklist.guard';
import { timeout, catchError, throwError, firstValueFrom } from 'rxjs';
import { IdempotencyInterceptor } from '../interceptors/idempotency.interceptor';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';

@ApiTags('Authentication')
@UseInterceptors(IdempotencyInterceptor)
@Controller({ path: 'auth', version: '1' })
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
        this.logger.warn(
          `Failed to connect to AUTH_SERVICE (attempt ${retries}/${maxRetries}). Retrying in ${delay}ms...`,
        );

        if (retries >= maxRetries) {
          this.logger.error('Failed to connect to AUTH_SERVICE after max retries', error);
          throw error;
        }

        await new Promise((resolve) => setTimeout(resolve, delay));
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
          this.authClient.send({ cmd: 'login' }, data).pipe(timeout(5000)),
        );
      },
      {
        timeout: 5000,
        errorThresholdPercentage: 50,
        resetTimeout: 30000,
        name: 'auth_login',
      },
    );

    this.loginCircuit.fallback(() => {
      throw new Error('Authentication service is temporarily unavailable. Please try again later.');
    });

    // Signup circuit breaker
    this.signupCircuit = this.circuitBreakerService.createCircuitBreaker(
      async (data: CreateUserDto) => {
        return await firstValueFrom(
          this.authClient.send({ cmd: 'signup' }, data).pipe(timeout(10000)),
        );
      },
      {
        timeout: 10000,
        errorThresholdPercentage: 50,
        resetTimeout: 30000,
        name: 'auth_signup',
      },
    );

    this.signupCircuit.fallback(() => {
      throw new Error('Signup service is temporarily unavailable. Please try again later.');
    });

    // Refresh token circuit breaker
    this.refreshTokenCircuit = this.circuitBreakerService.createCircuitBreaker(
      async (data: RefreshTokenDto) => {
        return await firstValueFrom(
          this.authClient.send({ cmd: 'refreshTokens' }, data).pipe(timeout(5000)),
        );
      },
      {
        timeout: 5000,
        errorThresholdPercentage: 50,
        resetTimeout: 30000,
        name: 'auth_refresh_token',
      },
    );

    this.refreshTokenCircuit.fallback(() => {
      throw new Error('Token refresh service is temporarily unavailable. Please login again.');
    });

    // Forgot password circuit breaker
    this.forgotPasswordCircuit = this.circuitBreakerService.createCircuitBreaker(
      async (data: ForgotPasswordDto) => {
        return await firstValueFrom(
          this.authClient.send({ cmd: 'forgotPassword' }, data).pipe(timeout(5000)),
        );
      },
      {
        timeout: 5000,
        errorThresholdPercentage: 50,
        resetTimeout: 30000,
        name: 'auth_forgot_password',
      },
    );

    this.forgotPasswordCircuit.fallback(() => {
      throw new Error('Password reset service is temporarily unavailable. Please try again later.');
    });

    // Reset password circuit breaker
    this.resetPasswordCircuit = this.circuitBreakerService.createCircuitBreaker(
      async (data: ResetPasswordDto) => {
        return await firstValueFrom(
          this.authClient.send({ cmd: 'resetPassword' }, data).pipe(timeout(5000)),
        );
      },
      {
        timeout: 5000,
        errorThresholdPercentage: 50,
        resetTimeout: 30000,
        name: 'auth_reset_password',
      },
    );

    this.resetPasswordCircuit.fallback(() => {
      throw new Error('Password reset service is temporarily unavailable. Please try again later.');
    });

    // Change password circuit breaker
    this.changePasswordCircuit = this.circuitBreakerService.createCircuitBreaker(
      async (data: ChangePasswordDto) => {
        return await firstValueFrom(
          this.authClient.send({ cmd: 'changePassword' }, data).pipe(timeout(5000)),
        );
      },
      {
        timeout: 5000,
        errorThresholdPercentage: 50,
        resetTimeout: 30000,
        name: 'auth_change_password',
      },
    );

    this.changePasswordCircuit.fallback(() => {
      throw new Error(
        'Password change service is temporarily unavailable. Please try again later.',
      );
    });

    // Sign out circuit breaker
    this.signOutCircuit = this.circuitBreakerService.createCircuitBreaker(
      async (data: any) => {
        return await firstValueFrom(
          this.authClient.send({ cmd: 'signOut' }, data).pipe(timeout(5000)),
        );
      },
      {
        timeout: 5000,
        errorThresholdPercentage: 50,
        resetTimeout: 30000,
        name: 'auth_sign_out',
      },
    );

    this.signOutCircuit.fallback(() => {
      throw new Error('Sign out service is temporarily unavailable. Please try again later.');
    });

    // Get profile circuit breaker
    this.getProfileCircuit = this.circuitBreakerService.createCircuitBreaker(
      async (data: any) => {
        return await firstValueFrom(
          this.authClient.send({ cmd: 'getProfile' }, data).pipe(timeout(5000)),
        );
      },
      {
        timeout: 5000,
        errorThresholdPercentage: 50,
        resetTimeout: 30000,
        name: 'auth_get_profile',
      },
    );

    this.getProfileCircuit.fallback(() => {
      throw new Error('Profile service is temporarily unavailable. Please try again later.');
    });

    this.logger.log('All auth circuit breakers initialized');
  }

  @Post('login')
  @ApiOperation({
    summary: 'User login',
    description:
      'Authenticate user with email and password. Returns access token and refresh token for authorized requests.',
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Successfully authenticated. Returns user data and JWT tokens.',
    schema: {
      example: {
        user: { id: '123', email: 'user@example.com', username: 'johndoe' },
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiResponse({ status: 503, description: 'Service temporarily unavailable' })
  async login(@Body() loginDto: LoginDto) {
    try {
      return await this.loginCircuit.fire(loginDto);
    } catch (error) {
      this.logger.error(`Login failed: ${error.message}`);
      throw error;
    }
  }

  @Post('signup')
  @ApiOperation({
    summary: 'User registration',
    description:
      'Create a new user account with email, username, and password. Email must be unique.',
  })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: 201,
    description: 'User successfully created',
    schema: {
      example: {
        id: '123',
        email: 'user@example.com',
        username: 'johndoe',
        createdAt: '2026-01-16T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input data or email already exists' })
  @ApiResponse({ status: 503, description: 'Service temporarily unavailable' })
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
  @ApiOperation({
    summary: 'Refresh access token',
    description:
      'Generate a new access token using a valid refresh token. Use this when the access token expires.',
  })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({
    status: 200,
    description: 'New access token generated',
    schema: {
      example: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token' })
  @ApiResponse({ status: 503, description: 'Service temporarily unavailable' })
  async refreshToken(@Body() body: RefreshTokenDto) {
    try {
      return await this.refreshTokenCircuit.fire(body);
    } catch (error) {
      this.logger.error(`Refresh token failed: ${error.message}`);
      throw error;
    }
  }

  @Post('forgotpassword')
  @ApiOperation({
    summary: 'Request password reset',
    description:
      'Send a password reset email to the registered email address. Email contains a reset token.',
  })
  @ApiBody({ type: ForgotPasswordDto })
  @ApiResponse({
    status: 200,
    description: 'Password reset email sent successfully',
    schema: {
      example: {
        message: 'Password reset email sent successfully',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Email not found' })
  @ApiResponse({ status: 503, description: 'Service temporarily unavailable' })
  async forgotPassword(@Body() body: ForgotPasswordDto) {
    try {
      return await this.forgotPasswordCircuit.fire(body);
    } catch (error) {
      this.logger.error(`Forgot password failed: ${error.message}`);
      throw error;
    }
  }

  @Post('resetpassword')
  @ApiOperation({
    summary: 'Reset password with token',
    description:
      'Reset user password using the token received via email. Token expires after a certain period.',
  })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({
    status: 200,
    description: 'Password reset successful',
    schema: {
      example: {
        message: 'Password has been reset successfully',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid or expired reset token' })
  @ApiResponse({ status: 503, description: 'Service temporarily unavailable' })
  async resetPassword(@Body() body: ResetPasswordDto) {
    try {
      return await this.resetPasswordCircuit.fire(body);
    } catch (error) {
      this.logger.error(`Reset password failed: ${error.message}`);
      throw error;
    }
  }

  @UseGuards(JwtBlacklistGuard)
  @ApiBearerAuth('JWT-auth')
  @Post('changepassword')
  @ApiOperation({
    summary: 'Change password (authenticated)',
    description: 'Change password for authenticated user. Requires current password verification.',
  })
  @ApiBody({ type: ChangePasswordDto })
  @ApiResponse({
    status: 200,
    description: 'Password changed successfully',
    schema: {
      example: {
        message: 'Password changed successfully',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid current password or token' })
  @ApiResponse({ status: 503, description: 'Service temporarily unavailable' })
  async changePassword(@Body() body: ChangePasswordDto, @Request() req) {
    try {
      return await this.changePasswordCircuit.fire({
        userId: req.user.id,
        changePasswordDto: body,
      });
    } catch (error) {
      this.logger.error(`Change password failed: ${error.message}`);
      throw error;
    }
  }

  @UseGuards(JwtBlacklistGuard)
  @ApiBearerAuth('JWT-auth')
  @Post('signout')
  @ApiOperation({
    summary: 'User logout',
    description: 'Sign out authenticated user and invalidate JWT token by adding it to blacklist.',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully signed out',
    schema: {
      example: {
        message: 'Successfully signed out',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  @ApiResponse({ status: 503, description: 'Service temporarily unavailable' })
  async signOut(@Request() req) {
    try {
      const jwtToken = req.headers['authorization']?.replace('Bearer ', '');
      return await this.signOutCircuit.fire({
        userId: req.user.id,
        token: jwtToken,
      });
    } catch (error) {
      this.logger.error(`Sign out failed: ${error.message}`);
      throw error;
    }
  }

  @UseGuards(JwtBlacklistGuard)
  @ApiBearerAuth('JWT-auth')
  @Get('getprofile')
  @ApiOperation({
    summary: 'Get user profile',
    description:
      'Retrieve authenticated user profile information including email, username, and account details.',
  })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
    schema: {
      example: {
        id: '123',
        email: 'user@example.com',
        username: 'johndoe',
        createdAt: '2026-01-16T10:00:00.000Z',
        updatedAt: '2026-01-16T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  @ApiResponse({ status: 503, description: 'Service temporarily unavailable' })
  async getProfile(@Request() req) {
    try {
      return await this.getProfileCircuit.fire({ userId: req.user.id });
    } catch (error) {
      this.logger.error(`Get profile failed: ${error.message}`);
      throw error;
    }
  }
}
