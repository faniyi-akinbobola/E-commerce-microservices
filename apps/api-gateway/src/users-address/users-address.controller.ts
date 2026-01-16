import {
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Body,
  Param,
  Req,
  UseGuards,
  ServiceUnavailableException,
  Logger,
  UseInterceptors,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { UpdateUserAddressDto, CreateUserAddressDto, Roles } from '@apps/common';
import { JwtBlacklistGuard } from '../guards/jwt-blacklist.guard';
import { OnModuleInit } from '@nestjs/common';
import { CircuitBreakerService } from '@apps/common';
import { lastValueFrom, timeout } from 'rxjs';
import { IdempotencyInterceptor } from '../interceptors/idempotency.interceptor';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Addresses')
@ApiBearerAuth('JWT-auth')
@UseInterceptors(IdempotencyInterceptor)
@UseGuards(JwtBlacklistGuard)
@Controller({ path: 'users-address', version: '1' })
export class UsersAddressController implements OnModuleInit {
  private readonly logger = new Logger(UsersAddressController.name);

  private createUserAddressCircuit;
  private getUserAddressesCircuit;
  private updateUserAddressCircuit;
  private deleteUserAddressCircuit;
  private getUserAddressByIdCircuit;

  constructor(
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
    private readonly circuitBreakerService: CircuitBreakerService,
  ) {}

  async onModuleInit() {
    this.initializeCircuitBreakers();
  }

  private initializeCircuitBreakers() {
    this.createUserAddressCircuit = this.circuitBreakerService.createCircuitBreaker(
      async (data: CreateUserAddressDto) => {
        return await lastValueFrom(
          this.authClient.send({ cmd: 'create_user_address' }, data).pipe(timeout(10000)),
        );
      },
      {
        timeout: 10000,
        errorThresholdPercentage: 50,
        resetTimeout: 3000,
        name: 'create_user_address',
      },
    );

    this.createUserAddressCircuit.fallback(() => {
      throw new ServiceUnavailableException(`Create user address failed. Please try again later.`);
    });

    this.getUserAddressesCircuit = this.circuitBreakerService.createCircuitBreaker(
      async (data: { userId: string }) => {
        return await lastValueFrom(
          this.authClient.send({ cmd: 'get_user_addresses' }, data).pipe(timeout(5000)),
        );
      },
      {
        timeout: 5000,
        errorThresholdPercentage: 50,
        resetTimeout: 3000,
        name: 'get_user_addresses',
      },
    );

    this.getUserAddressesCircuit.fallback(() => {
      throw new ServiceUnavailableException(`Get user addresses failed. Please try again later.`);
    });

    this.updateUserAddressCircuit = this.circuitBreakerService.createCircuitBreaker(
      async (data: { id: string } & UpdateUserAddressDto) => {
        return await lastValueFrom(
          this.authClient.send({ cmd: 'update_user_address' }, data).pipe(timeout(10000)),
        );
      },
      {
        timeout: 10000,
        errorThresholdPercentage: 50,
        resetTimeout: 3000,
        name: 'update_user_address',
      },
    );

    this.updateUserAddressCircuit.fallback(() => {
      throw new ServiceUnavailableException(`Update user address failed. Please try again later.`);
    });

    this.deleteUserAddressCircuit = this.circuitBreakerService.createCircuitBreaker(
      async (data: { id: string; userId: string }) => {
        return await lastValueFrom(
          this.authClient.send({ cmd: 'delete_user_address' }, data).pipe(timeout(5000)),
        );
      },
      {
        timeout: 5000,
        errorThresholdPercentage: 50,
        resetTimeout: 3000,
        name: 'delete_user_address',
      },
    );

    this.deleteUserAddressCircuit.fallback(() => {
      throw new ServiceUnavailableException(
        `Delete user address service failed. Please try again later.`,
      );
    });

    this.getUserAddressByIdCircuit = this.circuitBreakerService.createCircuitBreaker(
      async (data: { id: string; userId: string }) => {
        return await lastValueFrom(
          this.authClient.send({ cmd: 'get_user_address_by_id' }, data).pipe(timeout(5000)),
        );
      },
      {
        timeout: 5000,
        errorThresholdPercentage: 50,
        resetTimeout: 3000,
        name: 'get_user_address_by_id',
      },
    );

    this.getUserAddressByIdCircuit.fallback(() => {
      throw new ServiceUnavailableException(
        `Get user address by id failed. Please try again later.`,
      );
    });
  }

  @Roles('ADMIN', 'CUSTOMER')
  @Post('createuseraddress')
  @ApiOperation({
    summary: 'Create user address',
    description:
      "Add a new delivery address to the authenticated user's profile. Required for order checkout.",
  })
  @ApiBody({ type: CreateUserAddressDto })
  @ApiResponse({
    status: 201,
    description: 'Address created successfully',
    schema: {
      example: {
        id: 'addr_123',
        userId: '123',
        street: '123 Main St',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94102',
        country: 'USA',
        isDefault: true,
        createdAt: '2026-01-16T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  @ApiResponse({ status: 503, description: 'Service temporarily unavailable' })
  async createUserAddress(@Body() createUserAddressDto: CreateUserAddressDto, @Req() req) {
    // return this.authClient.send({ cmd: 'create_user_address' }, {...createUserAddressDto, userId: req.user.id });
    try {
      return await this.createUserAddressCircuit.fire({
        userId: req.user.id,
        ...createUserAddressDto,
      });
    } catch (error) {
      this.logger.error(`create user failed: ${error}`);
      throw error;
    }
  }

  @Roles('ADMIN', 'CUSTOMER')
  @Get('getuseraddresses')
  @ApiOperation({
    summary: 'Get all user addresses',
    description: 'Retrieve all saved addresses for the authenticated user.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of user addresses',
    schema: {
      example: [
        {
          id: 'addr_123',
          street: '123 Main St',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94102',
          isDefault: true,
        },
        {
          id: 'addr_124',
          street: '456 Oak Ave',
          city: 'Los Angeles',
          state: 'CA',
          zipCode: '90001',
          isDefault: false,
        },
      ],
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  @ApiResponse({ status: 503, description: 'Service temporarily unavailable' })
  async getUserAddresses(@Req() req) {
    // return this.authClient.send({ cmd: 'get_user_addresses' }, { userId: req.user.id });
    try {
      return await this.getUserAddressesCircuit.fire({
        userId: req.user.id,
      });
    } catch (error) {
      this.logger.error(`get user addresses failed: ${error}`);
      throw error;
    }
  }

  @Roles('ADMIN', 'CUSTOMER')
  @Patch('updateuseraddress/:id')
  @ApiOperation({
    summary: 'Update user address',
    description: 'Update an existing delivery address. Can set as default address.',
  })
  @ApiParam({ name: 'id', description: 'Address ID', example: 'addr_123' })
  @ApiBody({ type: UpdateUserAddressDto })
  @ApiResponse({
    status: 200,
    description: 'Address updated successfully',
    schema: {
      example: {
        id: 'addr_123',
        street: '123 Main St Apt 5',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94102',
        isDefault: true,
        updatedAt: '2026-01-16T12:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  @ApiResponse({ status: 404, description: 'Address not found' })
  @ApiResponse({ status: 503, description: 'Service temporarily unavailable' })
  async updateUserAddress(
    @Param('id') id: string,
    @Body() updateUserAddressDto: UpdateUserAddressDto,
    @Req() req,
  ) {
    // return this.authClient.send(
    //     { cmd: 'update_user_address' },
    //     { id, updateUserAddressDto, userId: req.user.id }
    // );
    try {
      return await this.updateUserAddressCircuit.fire({
        id,
        userId: req.user.id,
        updateUserAddressDto,
      });
    } catch (error) {
      this.logger.error(`Update user address failed: ${error}`);
      throw error;
    }
  }

  @Roles('ADMIN', 'CUSTOMER')
  @Delete('deleteuseraddress/:id')
  @ApiOperation({
    summary: 'Delete user address',
    description:
      "Remove a saved address from the user's profile. Default address cannot be deleted if other addresses exist.",
  })
  @ApiParam({ name: 'id', description: 'Address ID to delete', example: 'addr_123' })
  @ApiResponse({
    status: 200,
    description: 'Address deleted successfully',
    schema: {
      example: {
        message: 'Address deleted successfully',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  @ApiResponse({ status: 404, description: 'Address not found' })
  @ApiResponse({ status: 503, description: 'Service temporarily unavailable' })
  async deleteUserAddress(@Param('id') id: string, @Req() req) {
    // return this.authClient.send(
    //     { cmd: 'delete_user_address' },
    //     { id, userId: req.user.id }
    // );
    try {
      return await this.deleteUserAddressCircuit.fire({
        id,
        userId: req.user.id,
      });
    } catch (error) {
      this.logger.error(`delete user address failed: ${error}`);
      throw error;
    }
  }

  @Roles('ADMIN', 'CUSTOMER')
  @Get('getuseraddressbyid/:id')
  @ApiOperation({
    summary: 'Get address by ID',
    description: 'Retrieve detailed information about a specific saved address.',
  })
  @ApiParam({ name: 'id', description: 'Address ID', example: 'addr_123' })
  @ApiResponse({
    status: 200,
    description: 'Address details',
    schema: {
      example: {
        id: 'addr_123',
        userId: '123',
        street: '123 Main St',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94102',
        country: 'USA',
        isDefault: true,
        createdAt: '2026-01-16T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  @ApiResponse({ status: 404, description: 'Address not found' })
  @ApiResponse({ status: 503, description: 'Service temporarily unavailable' })
  async getUserAddressById(@Param('id') id: string, @Req() req) {
    // return this.authClient.send({ cmd: 'get_user_address_by_id' }, { id, userId: req.user.id });
    try {
      return await this.getUserAddressByIdCircuit.fire({
        userId: req.user.id,
        id,
      });
    } catch (error) {
      this.logger.error(`Get user address by id failed: ${error}`);
      throw error;
    }
  }
}
