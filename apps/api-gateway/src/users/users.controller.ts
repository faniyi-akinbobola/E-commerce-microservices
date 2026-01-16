import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Inject,
  Param,
  Body,
  UseGuards,
  Req,
  OnModuleInit,
  Logger,
  ServiceUnavailableException,
  UseInterceptors,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { UpdateUserDto } from 'common/dtos/update-user.dto';
import { JwtBlacklistGuard } from '../guards/jwt-blacklist.guard';
import { Roles } from '@apps/common';
import { lastValueFrom } from 'rxjs';
import { CircuitBreakerService } from '@apps/common';
import { timeout } from 'rxjs/operators';
import { IdempotencyInterceptor } from '../interceptors/idempotency.interceptor';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Users')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtBlacklistGuard)
@UseInterceptors(IdempotencyInterceptor)
@Controller({ path: 'users', version: '1' })
export class UsersController implements OnModuleInit {
  private readonly logger = new Logger(UsersController.name);

  private getUsersCircuit;
  private getUserByIdCircuit;
  private deleteUserCircuit;
  private updateUserCircuit;
  private deleteUserByAdminCircuit;

  constructor(
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
    private readonly circuitBreakerService: CircuitBreakerService,
  ) {}

  async onModuleInit() {
    this.initializeCircuitBreakers();
  }

  private initializeCircuitBreakers() {
    this.getUsersCircuit = this.circuitBreakerService.createCircuitBreaker(
      async () => {
        return await lastValueFrom(
          this.authClient.send({ cmd: 'get_users' }, {}).pipe(timeout(5000)),
        );
      },
      {
        timeout: 5000,
        errorThresholdPercentage: 50,
        resetTimeout: 3000,
        name: 'get_users',
      },
    );

    this.getUsersCircuit.fallback(() => {
      throw new Error('Get users service is temporarily unavailable. Please try again later.');
    });

    this.getUserByIdCircuit = this.circuitBreakerService.createCircuitBreaker(
      async (id: string) => {
        return await lastValueFrom(
          this.authClient.send({ cmd: 'get_user_by_id' }, { id }).pipe(timeout(5000)),
        );
      },
      {
        timeout: 5000,
        errorThresholdPercentage: 50,
        resetTimeout: 3000,
        name: 'get_user_by_id',
      },
    );

    this.getUserByIdCircuit.fallback(() => {
      throw new Error('Get user by ID service is temporarily unavailable. Please try again later.');
    });

    this.deleteUserCircuit = this.circuitBreakerService.createCircuitBreaker(
      async (data: { id: string; requesterId: string; token?: string }) => {
        return await lastValueFrom(
          this.authClient.send({ cmd: 'delete_user' }, data).pipe(timeout(5000)),
        );
      },
      {
        timeout: 5000,
        errorThresholdPercentage: 50,
        resetTimeout: 3000,
        name: 'delete_user',
      },
    );

    this.deleteUserCircuit.fallback(() => {
      throw new Error('Delete user service is temporarily unavailable. Please try again later.');
    });

    this.updateUserCircuit = this.circuitBreakerService.createCircuitBreaker(
      async (data: { id: string; requesterId: string; updateUserDto: UpdateUserDto }) => {
        return await lastValueFrom(
          this.authClient.send({ cmd: 'update_user' }, data).pipe(timeout(5000)),
        );
      },
      {
        timeout: 5000,
        errorThresholdPercentage: 50,
        resetTimeout: 3000,
        name: 'update_user',
      },
    );

    this.updateUserCircuit.fallback(() => {
      throw new Error('Update user service is temporarily unavailable. Please try again later.');
    });

    this.deleteUserByAdminCircuit = this.circuitBreakerService.createCircuitBreaker(
      async (data: { id: string; requesterId: string; token?: string }) => {
        return await lastValueFrom(
          this.authClient.send({ cmd: 'delete_user_by_admin' }, data).pipe(timeout(10000)),
        );
      },
      {
        timeout: 10000,
        errorThresholdPercentage: 50,
        resetTimeout: 3000,
        name: 'delete_user_by_admin',
      },
    );

    this.deleteUserByAdminCircuit.fallback(() => {
      throw new Error(
        'Delete user by admin service is temporarily unavailable. Please try again later.',
      );
    });
  }

  @Roles('ADMIN')
  @Get('getusers')
  @ApiOperation({
    summary: 'Get all users (Admin only)',
    description: 'Retrieve a list of all registered users. Requires ADMIN role.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of all users',
    schema: {
      example: [
        {
          id: '123',
          email: 'user1@example.com',
          username: 'johndoe',
          role: 'USER',
          createdAt: '2026-01-16T10:00:00.000Z',
        },
        {
          id: '124',
          email: 'user2@example.com',
          username: 'janedoe',
          role: 'USER',
          createdAt: '2026-01-16T11:00:00.000Z',
        },
      ],
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  @ApiResponse({ status: 403, description: 'Forbidden - Requires ADMIN role' })
  @ApiResponse({ status: 503, description: 'Service temporarily unavailable' })
  async getUsers() {
    // return this.authClient.send({cmd: 'get_users' }, {})
    try {
      return await this.getUsersCircuit.fire();
    } catch (error) {
      this.logger.error(`Get users failed: ${error.message}`);
      throw error;
    }
  }

  @Roles('ADMIN', 'CUSTOMER')
  @Get('getuser/:id')
  @ApiOperation({
    summary: 'Get user by ID',
    description:
      'Retrieve detailed information about a specific user. Users can view their own profile, admins can view any user.',
  })
  @ApiParam({ name: 'id', description: 'User ID', example: '123' })
  @ApiResponse({
    status: 200,
    description: 'User details',
    schema: {
      example: {
        id: '123',
        email: 'user@example.com',
        username: 'johndoe',
        role: 'USER',
        createdAt: '2026-01-16T10:00:00.000Z',
        updatedAt: '2026-01-16T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 503, description: 'Service temporarily unavailable' })
  async getUserById(@Param('id') id: string) {
    // return this.authClient.send({cmd:'get_user_by_id'}, {id})
    try {
      return await this.getUserByIdCircuit.fire(id);
    } catch (error) {
      this.logger.error(`Get user by ID failed: ${error.message}`);
      throw error;
    }
  }

  @Roles('ADMIN', 'CUSTOMER')
  @Delete('deleteuser')
  @ApiOperation({
    summary: 'Delete own account',
    description: 'Delete the authenticated user account. This action is irreversible.',
  })
  @ApiResponse({
    status: 200,
    description: 'User account deleted successfully',
    schema: {
      example: {
        message: 'User account deleted successfully',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  @ApiResponse({ status: 503, description: 'Service temporarily unavailable' })
  async deleteUser(@Req() req) {
    // const jwtToken = req.headers['authorization']?.replace('Bearer ', '');
    // return this.authClient.send({ cmd: 'delete_user' }, { id: req.user.id, requesterId: req.user.id, token: jwtToken });
    try {
      const jwtToken = req.headers['authorization']?.replace('Bearer ', '');
      return await this.deleteUserCircuit.fire({
        id: req.user.id,
        requesterId: req.user.id,
        token: jwtToken,
      });
    } catch (error) {
      this.logger.error(`Delete user failed: ${error}`);
      throw error;
    }
  }

  @Roles('ADMIN', 'CUSTOMER')
  @Patch('updateuser')
  @ApiOperation({
    summary: 'Update user profile',
    description:
      'Update authenticated user profile information such as username, email, or other details.',
  })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({
    status: 200,
    description: 'User profile updated successfully',
    schema: {
      example: {
        id: '123',
        email: 'newemail@example.com',
        username: 'newusername',
        updatedAt: '2026-01-16T12:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input data or email already exists' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  @ApiResponse({ status: 503, description: 'Service temporarily unavailable' })
  async updateUser(@Body() updateUserDto: UpdateUserDto, @Req() req) {
    // return this.authClient.send({ cmd: 'update_user' }, { id: req.user.id, requesterId: req.user.id, updateUserDto });
    try {
      return await this.updateUserCircuit.fire({
        id: req.user.id,
        requesterId: req.user.id,
        updateUserDto,
      });
    } catch (error) {
      this.logger.error(`Update user failed: ${error}`);
      throw error;
    }
  }

  // DELETE ACCOUNT FOR ADMIN TO DELETE ANY USER
  @Roles('ADMIN')
  @Delete('deleteuser/:id')
  @ApiOperation({
    summary: 'Delete user by ID (Admin only)',
    description: 'Admin endpoint to delete any user account by ID. This action is irreversible.',
  })
  @ApiParam({ name: 'id', description: 'User ID to delete', example: '123' })
  @ApiResponse({
    status: 200,
    description: 'User deleted successfully',
    schema: {
      example: {
        message: 'User deleted successfully',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  @ApiResponse({ status: 403, description: 'Forbidden - Requires ADMIN role' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 503, description: 'Service temporarily unavailable' })
  async deleteUserByAdmin(@Param('id') id: string, @Req() req) {
    // const jwtToken = req.headers['authorization']?.replace('Bearer ', '');
    // return this.authClient.send({ cmd: 'delete_user' }, { id, requesterId: req.user.id, token: jwtToken });
    try {
      const jwtToken = req.headers['authorization']?.replace('Bearer ', '');
      return await this.deleteUserByAdminCircuit.fire({
        id,
        requesterId: req.user.id,
        token: jwtToken,
      });
    } catch (error) {
      this.logger.error(`Delete user by admin failed: ${error}`);
      throw error;
    }
  }
}
