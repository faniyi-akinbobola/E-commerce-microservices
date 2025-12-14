import { Controller, Inject, Patch, Post, UseGuards, Body,Param, Get,OnModuleInit,Logger, ServiceUnavailableException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { JwtBlacklistGuard } from '../guards/jwt-blacklist.guard';
import { CreateInventoryDto, UpdateInventoryDto, AddStockDto, ReduceStockDto, ReleaseStockDto, ReserveStockDto, Roles, Public } from '@apps/common';
import { lastValueFrom, timeout } from 'rxjs';
import { CircuitBreakerService } from '@apps/common';

@UseGuards(JwtBlacklistGuard)
@Controller('inventory')
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

    constructor(@Inject('INVENTORY_SERVICE') private readonly inventoryClient: ClientProxy,
      private readonly circuitBreakerService: CircuitBreakerService,
    ) {}

    async onModuleInit() {
      this.initializeCircuitBreakers();
    }

    private initializeCircuitBreakers() {
        this.reduceStockCircuit = this.circuitBreakerService.createCircuitBreaker(
        async (data: ReduceStockDto) => {
          return await lastValueFrom(
            this.inventoryClient.send({ cmd: 'reduce_stock' }, data).pipe(timeout(10000))
          );
        },
        {
          timeout: 10000,
          errorThresholdPercentage: 50,
          resetTimeout: 30000,
          name: 'inventory_reduce_stock',
        }
      );

      this.reduceStockCircuit.fallback(() => {
        throw new ServiceUnavailableException('Reduce stock service is temporarily unavailable. Please try again later.');
      } 
      );

      this.releaseStockCircuit = this.circuitBreakerService.createCircuitBreaker(
        async (data: ReleaseStockDto) => {
          return await lastValueFrom(
            this.inventoryClient.send({ cmd: 'release_stock' }, data).pipe(timeout(10000))
          );
        },
        {
          timeout: 10000,
          errorThresholdPercentage: 50,
          resetTimeout: 30000,
          name: 'inventory_release_stock',
        }
      );

      this.releaseStockCircuit.fallback(() => {
        throw new ServiceUnavailableException('Release stock service is temporarily unavailable. Please try again later.');
      } 
      );

        this.reserveStockCircuit = this.circuitBreakerService.createCircuitBreaker(
        async (data: ReserveStockDto) => {
          return await lastValueFrom(
            this.inventoryClient.send({ cmd: 'reserve_stock' }, data).pipe(timeout(10000))
          );
        },
        {
          timeout: 10000,
          errorThresholdPercentage: 50,
          resetTimeout: 30000,
          name: 'inventory_reserve_stock',
        }
      );

      this.reserveStockCircuit.fallback(() => {
        throw new ServiceUnavailableException('Reserve stock service is temporarily unavailable. Please try again later.');
      }
        );

        this.addStockCircuit = this.circuitBreakerService.createCircuitBreaker(
        async (data: AddStockDto) => {
          return await lastValueFrom(
            this.inventoryClient.send({ cmd: 'add_stock' }, data).pipe(timeout(10000))
          );
        },
        {
          timeout: 10000,
          errorThresholdPercentage: 50,
          resetTimeout: 30000,
          name: 'inventory_add_stock',
        }
      );

      this.addStockCircuit.fallback(() => {
        throw new ServiceUnavailableException('Add stock service is temporarily unavailable. Please try again later.');
      } 
      );

        this.getAvailableProductsCircuit = this.circuitBreakerService.createCircuitBreaker(
        async () => {
          return await lastValueFrom(
            this.inventoryClient.send({ cmd: 'get_available_products' }, {}).pipe(timeout(5000))
          );
        },
        {
          timeout: 5000,
          errorThresholdPercentage: 50,
          resetTimeout: 30000,
          name: 'inventory_get_available_products',
        }
      );

      this.getAvailableProductsCircuit.fallback(() => {
        throw new ServiceUnavailableException('Get available products service is temporarily unavailable. Please try again later.');
      } 
      );

        this.getInventoryForProductCircuit = this.circuitBreakerService.createCircuitBreaker(
        async (id: string ) => {
          return await lastValueFrom(
            this.inventoryClient.send({ cmd: 'get_inventory_for_product' }, { id }).pipe(timeout(5000))
          );
        },
        {
          timeout: 5000,
          errorThresholdPercentage: 50,
          resetTimeout: 30000,
          name: 'inventory_get_inventory_for_product',
        }
      );

      this.getInventoryForProductCircuit.fallback(() => {
        throw new ServiceUnavailableException('Get inventory for product service is temporarily unavailable. Please try again later.');
      } 
      );

        this.createInventoryCircuit = this.circuitBreakerService.createCircuitBreaker(
        async (data: CreateInventoryDto) => {
          return await lastValueFrom(
            this.inventoryClient.send({ cmd: 'create_inventory' }, data).pipe(timeout(10000))
          );
        },
        {
          timeout: 10000,
          errorThresholdPercentage: 50,
          resetTimeout: 30000,
          name: 'inventory_create_inventory',
        }
      );

      this.createInventoryCircuit.fallback(() => {
        throw new ServiceUnavailableException('Create inventory service is temporarily unavailable. Please try again later.');
      } 
      );

        this.updateInventoryCircuit = this.circuitBreakerService.createCircuitBreaker(
        async (data: { productId: string } & UpdateInventoryDto) => {
          return await lastValueFrom(
            this.inventoryClient.send({ cmd: 'update_inventory' }, data).pipe(timeout(10000))
          );
        },
        {
          timeout: 10000,
          errorThresholdPercentage: 50,
          resetTimeout: 30000,
          name: 'inventory_update_inventory',
        }
      );

      this.updateInventoryCircuit.fallback(() => {
        throw new ServiceUnavailableException('Update inventory service is temporarily unavailable. Please try again later.');
      } 
      );


    }

    @Roles('ADMIN', 'INVENTORY_MANAGER')
    @Post('reducestock')
    async reduceStock(@Body() body: ReduceStockDto) {
        // return this.inventoryClient.send({ cmd: 'reduce_stock' }, body);
        try {
            return await this.reduceStockCircuit.fire(body);
        } catch (error) {
            this.logger.error(`Reduce stock failed: ${error.message}`);
            throw error;
        }
    }

    @Roles('ADMIN', 'INVENTORY_MANAGER')
    @Post('releasestock')
    async releaseStock(@Body() body: ReleaseStockDto) {
        // return this.inventoryClient.send({ cmd: 'release_stock' }, body);
        try {
            return await this.releaseStockCircuit.fire(body);
        } catch (error) {
            this.logger.error(`Release stock failed: ${error.message}`);
            throw error;
        }
    }

    @Roles('ADMIN', 'INVENTORY_MANAGER')
    @Post('reservestock')
    async reserveStock(@Body() body: ReserveStockDto) {
        // return this.inventoryClient.send({ cmd: 'reserve_stock' }, body);
        try {
            return await this.reserveStockCircuit.fire(body);
        } catch (error) {
            this.logger.error(`Reserve stock failed: ${error.message}`);
            throw error;
        }
    }

    @Roles('ADMIN', 'INVENTORY_MANAGER')
    @Post('addstock')
    async addStock(@Body() body: AddStockDto) {
        // return this.inventoryClient.send({ cmd: 'add_stock' }, body)
        try {
            return await this.addStockCircuit.fire(body);
        } catch (error) {
            this.logger.error(`Add stock failed: ${error.message}`);
            throw error;
        }
    }

    @Public()
    @Get('getavailableproducts')
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
    async getInventoryForProduct(@Param('id') id: string) {
        // return this.inventoryClient.send({ cmd: 'get_inventory_for_product' }, { id });
        try {
            return await this.getInventoryForProductCircuit.fire({ id });
        } catch (error) {
            this.logger.error(`Get inventory for product failed: ${error.message}`);
            throw error;
        }
    }

    @Roles('ADMIN', 'INVENTORY_MANAGER')
    @Post('createinventory')
    async createInventory(@Body() body: CreateInventoryDto) {
        // return this.inventoryClient.send({ cmd: 'create_inventory' }, body);
        try {
            return await this.createInventoryCircuit.fire(body);
        } catch (error) {
            this.logger.error(`Create inventory failed: ${error.message}`);
            throw error;
        }
    }

    @Roles('ADMIN', 'INVENTORY_MANAGER')
    @Patch('updateinventory/:productId')
    async updateInventory(@Param('productId') productId: string, @Body() body: UpdateInventoryDto) {
        // return this.inventoryClient.send({ cmd: 'update_inventory' }, { productId, ...body });
        try {
            return await this.updateInventoryCircuit.fire({ productId, ...body });
        } catch (error) {
            this.logger.error(`Update inventory failed: ${error.message}`);
            throw error;
        }
    }
}
