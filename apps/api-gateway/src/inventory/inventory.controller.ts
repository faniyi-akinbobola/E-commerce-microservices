import {
  Controller,
  Inject,
  Patch,
  Post,
  UseGuards,
  Body,
  Param,
  Get,
  OnModuleInit,
  Logger,
  ServiceUnavailableException,
  UseInterceptors,
  Req,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { JwtBlacklistGuard } from '../guards/jwt-blacklist.guard';
import {
  CreateInventoryDto,
  UpdateInventoryDto,
  AddStockDto,
  ReduceStockDto,
  ReleaseStockDto,
  ReserveStockDto,
  Roles,
  Public,
} from '@apps/common';
import { lastValueFrom, timeout } from 'rxjs';
import { CircuitBreakerService } from '@apps/common';
import { IdempotencyInterceptor } from '../interceptors/idempotency.interceptor';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Inventory')
@UseGuards(JwtBlacklistGuard)
@UseInterceptors(IdempotencyInterceptor)
@Controller({ path: 'inventory', version: '1' })
export class InventoryController implements OnModuleInit {
  private readonly logger = new Logger(InventoryController.name);

  private reduceStockCircuit;
  private releaseStockCircuit;
  private reserveStockCircuit;
  private addStockCircuit;
  private getAvailableProductsCircuit;
  private getInventoryForProductCircuit;
  private createInventoryCircuit;
  private updateInventoryCircuit;

  constructor(
    @Inject('INVENTORY_SERVICE') private readonly inventoryClient: ClientProxy,
    private readonly circuitBreakerService: CircuitBreakerService,
  ) {}

  async onModuleInit() {
    this.initializeCircuitBreakers();
  }

  private initializeCircuitBreakers() {
    this.reduceStockCircuit = this.circuitBreakerService.createCircuitBreaker(
      async (data: ReduceStockDto) => {
        return await lastValueFrom(
          this.inventoryClient.send({ cmd: 'reduce_stock' }, data).pipe(timeout(10000)),
        );
      },
      {
        timeout: 10000,
        errorThresholdPercentage: 50,
        resetTimeout: 30000,
        name: 'inventory_reduce_stock',
      },
    );

    this.reduceStockCircuit.fallback(() => {
      throw new ServiceUnavailableException(
        'Reduce stock service is temporarily unavailable. Please try again later.',
      );
    });

    this.releaseStockCircuit = this.circuitBreakerService.createCircuitBreaker(
      async (data: ReleaseStockDto) => {
        return await lastValueFrom(
          this.inventoryClient.send({ cmd: 'release_stock' }, data).pipe(timeout(10000)),
        );
      },
      {
        timeout: 10000,
        errorThresholdPercentage: 50,
        resetTimeout: 30000,
        name: 'inventory_release_stock',
      },
    );

    this.releaseStockCircuit.fallback(() => {
      throw new ServiceUnavailableException(
        'Release stock service is temporarily unavailable. Please try again later.',
      );
    });

    this.reserveStockCircuit = this.circuitBreakerService.createCircuitBreaker(
      async (data: ReserveStockDto) => {
        return await lastValueFrom(
          this.inventoryClient.send({ cmd: 'reserve_stock' }, data).pipe(timeout(10000)),
        );
      },
      {
        timeout: 10000,
        errorThresholdPercentage: 50,
        resetTimeout: 30000,
        name: 'inventory_reserve_stock',
      },
    );

    this.reserveStockCircuit.fallback(() => {
      throw new ServiceUnavailableException(
        'Reserve stock service is temporarily unavailable. Please try again later.',
      );
    });

    this.addStockCircuit = this.circuitBreakerService.createCircuitBreaker(
      async (data: AddStockDto) => {
        return await lastValueFrom(
          this.inventoryClient.send({ cmd: 'add_stock' }, data).pipe(timeout(10000)),
        );
      },
      {
        timeout: 10000,
        errorThresholdPercentage: 50,
        resetTimeout: 30000,
        name: 'inventory_add_stock',
      },
    );

    this.addStockCircuit.fallback(() => {
      throw new ServiceUnavailableException(
        'Add stock service is temporarily unavailable. Please try again later.',
      );
    });

    this.getAvailableProductsCircuit = this.circuitBreakerService.createCircuitBreaker(
      async () => {
        return await lastValueFrom(
          this.inventoryClient.send({ cmd: 'get_available_products' }, {}).pipe(timeout(5000)),
        );
      },
      {
        timeout: 5000,
        errorThresholdPercentage: 50,
        resetTimeout: 30000,
        name: 'inventory_get_available_products',
      },
    );

    this.getAvailableProductsCircuit.fallback(() => {
      throw new ServiceUnavailableException(
        'Get available products service is temporarily unavailable. Please try again later.',
      );
    });

    this.getInventoryForProductCircuit = this.circuitBreakerService.createCircuitBreaker(
      async (id: string) => {
        return await lastValueFrom(
          this.inventoryClient
            .send({ cmd: 'get_inventory_for_product' }, { id })
            .pipe(timeout(5000)),
        );
      },
      {
        timeout: 5000,
        errorThresholdPercentage: 50,
        resetTimeout: 30000,
        name: 'inventory_get_inventory_for_product',
      },
    );

    this.getInventoryForProductCircuit.fallback(() => {
      throw new ServiceUnavailableException(
        'Get inventory for product service is temporarily unavailable. Please try again later.',
      );
    });

    this.createInventoryCircuit = this.circuitBreakerService.createCircuitBreaker(
      async (data: CreateInventoryDto) => {
        return await lastValueFrom(
          this.inventoryClient.send({ cmd: 'create_inventory' }, data).pipe(timeout(10000)),
        );
      },
      {
        timeout: 10000,
        errorThresholdPercentage: 50,
        resetTimeout: 30000,
        name: 'inventory_create_inventory',
      },
    );

    this.createInventoryCircuit.fallback(() => {
      throw new ServiceUnavailableException(
        'Create inventory service is temporarily unavailable. Please try again later.',
      );
    });

    this.updateInventoryCircuit = this.circuitBreakerService.createCircuitBreaker(
      async (data: {
        productId: string;
        updateInventoryDto: UpdateInventoryDto;
        idempotencyKey: string;
      }) => {
        return await lastValueFrom(
          this.inventoryClient.send({ cmd: 'update_inventory' }, data).pipe(timeout(10000)),
        );
      },
      {
        timeout: 10000,
        errorThresholdPercentage: 50,
        resetTimeout: 30000,
        name: 'inventory_update_inventory',
      },
    );

    this.updateInventoryCircuit.fallback(() => {
      throw new ServiceUnavailableException(
        'Update inventory service is temporarily unavailable. Please try again later.',
      );
    });
  }

  @Roles('ADMIN', 'INVENTORY_MANAGER')
  @ApiBearerAuth('JWT-auth')
  @Post('reducestock')
  @ApiOperation({
    summary: 'Reduce stock',
    description:
      'Reduce inventory stock for a product. Used when items are sold or damaged. Requires ADMIN or INVENTORY_MANAGER role.',
  })
  @ApiBody({ type: ReduceStockDto })
  @ApiResponse({
    status: 200,
    description: 'Stock reduced successfully',
    schema: {
      example: {
        productId: 'prod_123456',
        previousQuantity: 100,
        reducedBy: 10,
        newQuantity: 90,
        updatedAt: '2026-01-16T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Insufficient stock or invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Requires ADMIN or INVENTORY_MANAGER role' })
  async reduceStock(@Req() req, @Body() body: ReduceStockDto) {
    try {
      const idempotencyKey = req.headers['idempotency-key'] || req.headers['x-idempotency-key'];
      return await this.reduceStockCircuit.fire({ dto: body, idempotencyKey });
    } catch (error) {
      this.logger.error(`Reduce stock failed: ${error.message}`);
      throw error;
    }
  }

  @Roles('ADMIN', 'INVENTORY_MANAGER')
  @ApiBearerAuth('JWT-auth')
  @Post('releasestock')
  @ApiOperation({
    summary: 'Release reserved stock',
    description:
      'Release previously reserved stock back to available inventory. Used when orders are cancelled. Requires ADMIN or INVENTORY_MANAGER role.',
  })
  @ApiBody({ type: ReleaseStockDto })
  @ApiResponse({
    status: 200,
    description: 'Stock released successfully',
    schema: {
      example: {
        productId: 'prod_123456',
        releasedQuantity: 3,
        newAvailableStock: 93,
        orderId: 'order_789012',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async releaseStock(@Req() req, @Body() body: ReleaseStockDto) {
    try {
      const idempotencyKey = req.headers['idempotency-key'] || req.headers['x-idempotency-key'];
      return await this.releaseStockCircuit.fire({ releaseStockDto: body, idempotencyKey });
    } catch (error) {
      this.logger.error(`Release stock failed: ${error.message}`);
      throw error;
    }
  }

  @Roles('ADMIN', 'INVENTORY_MANAGER')
  @ApiBearerAuth('JWT-auth')
  @Post('reservestock')
  @ApiOperation({
    summary: 'Reserve stock',
    description:
      'Reserve stock for an order. Reduces available quantity without removing from inventory. Requires ADMIN or INVENTORY_MANAGER role.',
  })
  @ApiBody({ type: ReserveStockDto })
  @ApiResponse({
    status: 200,
    description: 'Stock reserved successfully',
    schema: {
      example: {
        productId: 'prod_123456',
        reservedQuantity: 5,
        remainingAvailable: 85,
        orderId: 'order_789012',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Insufficient stock' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async reserveStock(@Req() req, @Body() body: ReserveStockDto) {
    try {
      const idempotencyKey = req.headers['idempotency-key'] || req.headers['x-idempotency-key'];
      return await this.reserveStockCircuit.fire({ reserveStockDto: body, idempotencyKey });
    } catch (error) {
      this.logger.error(`Reserve stock failed: ${error.message}`);
      throw error;
    }
  }

  @Roles('ADMIN', 'INVENTORY_MANAGER')
  @ApiBearerAuth('JWT-auth')
  @Post('addstock')
  @ApiOperation({
    summary: 'Add stock',
    description:
      'Add inventory stock for a product. Used when receiving new shipments. Requires ADMIN or INVENTORY_MANAGER role.',
  })
  @ApiBody({ type: AddStockDto })
  @ApiResponse({
    status: 200,
    description: 'Stock added successfully',
    schema: {
      example: {
        productId: 'prod_123456',
        previousQuantity: 85,
        addedQuantity: 50,
        newQuantity: 135,
        updatedAt: '2026-01-16T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async addStock(@Req() req, @Body() body: AddStockDto) {
    try {
      const idempotencyKey = req.headers['idempotency-key'] || req.headers['x-idempotency-key'];
      return await this.addStockCircuit.fire({ addStockDto: body, idempotencyKey });
    } catch (error) {
      this.logger.error(`Add stock failed: ${error.message}`);
      throw error;
    }
  }

  @Public()
  @Get('getavailableproducts')
  @ApiOperation({
    summary: 'Get available products',
    description: 'Retrieve all products that have available inventory stock. Public endpoint.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of available products',
    schema: {
      example: [
        {
          productId: 'prod_123456',
          name: 'MacBook Pro 16"',
          availableQuantity: 85,
          totalQuantity: 100,
          reservedQuantity: 15,
        },
        {
          productId: 'prod_789012',
          name: 'iPhone 15 Pro',
          availableQuantity: 150,
          totalQuantity: 200,
          reservedQuantity: 50,
        },
      ],
    },
  })
  async getAvailableProducts() {
    // return this.inventoryClient.send({ cmd: 'get_available_products' }, {});
    try {
      return await this.getAvailableProductsCircuit.fire();
    } catch (error) {
      this.logger.error(`Get available products failed: ${error.message}`);
      throw error;
    }
  }

  @Public()
  @Get('getinventoryforproduct/:id')
  @ApiOperation({
    summary: 'Get inventory for product',
    description:
      'Get detailed inventory information for a specific product by ID. Public endpoint.',
  })
  @ApiResponse({
    status: 200,
    description: 'Product inventory details',
    schema: {
      example: {
        productId: 'prod_123456',
        totalQuantity: 100,
        availableQuantity: 85,
        reservedQuantity: 15,
        isActive: true,
        lastUpdated: '2026-01-16T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Product inventory not found' })
  async getInventoryForProduct(@Param('id') id: string) {
    // return this.inventoryClient.send({ cmd: 'get_inventory_for_product' }, { id });
    try {
      return await this.getInventoryForProductCircuit.fire(id);
    } catch (error) {
      this.logger.error(`Get inventory for product failed: ${error.message}`);
      throw error;
    }
  }

  @Roles('ADMIN', 'INVENTORY_MANAGER')
  @ApiBearerAuth('JWT-auth')
  @Post('createinventory')
  @ApiOperation({
    summary: 'Create inventory',
    description:
      'Create a new inventory record for a product. Requires ADMIN or INVENTORY_MANAGER role.',
  })
  @ApiBody({ type: CreateInventoryDto })
  @ApiResponse({
    status: 201,
    description: 'Inventory created successfully',
    schema: {
      example: {
        id: 'inv_123456',
        productId: 'prod_789012',
        quantity: 100,
        isActive: true,
        createdAt: '2026-01-16T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input or inventory already exists' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async createInventory(@Req() req, @Body() body: CreateInventoryDto) {
    try {
      const idempotencyKey = req.headers['idempotency-key'] || req.headers['x-idempotency-key'];
      return await this.createInventoryCircuit.fire({ createInventoryDto: body, idempotencyKey });
    } catch (error) {
      this.logger.error(`Create inventory failed: ${error.message}`);
      throw error;
    }
  }

  @Roles('ADMIN', 'INVENTORY_MANAGER')
  @ApiBearerAuth('JWT-auth')
  @Patch('updateinventory/:productId')
  @ApiOperation({
    summary: 'Update inventory',
    description:
      'Update inventory details for a product including quantity and active status. Requires ADMIN or INVENTORY_MANAGER role.',
  })
  @ApiBody({ type: UpdateInventoryDto })
  @ApiResponse({
    status: 200,
    description: 'Inventory updated successfully',
    schema: {
      example: {
        productId: 'prod_789012',
        quantity: 150,
        isActive: true,
        updatedAt: '2026-01-16T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Inventory not found' })
  async updateInventory(
    @Req() req,
    @Param('productId') productId: string,
    @Body() body: UpdateInventoryDto,
  ) {
    try {
      const idempotencyKey = req.headers['idempotency-key'] || req.headers['x-idempotency-key'];
      return await this.updateInventoryCircuit.fire({
        productId,
        updateInventoryDto: body,
        idempotencyKey,
      });
    } catch (error) {
      this.logger.error(`Update inventory failed: ${error.message}`);
      throw error;
    }
  }
}
