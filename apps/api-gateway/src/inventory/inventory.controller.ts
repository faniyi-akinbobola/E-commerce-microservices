import { Controller, Inject, Patch, Post, UseGuards, Body,Param, Get } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { JwtBlacklistGuard } from '../guards/jwt-blacklist.guard';
import { CreateInventoryDto, UpdateInventoryDto, AddStockDto, ReduceStockDto, ReleaseStockDto, ReserveStockDto, Roles, Public } from '@apps/common';


@UseGuards(JwtBlacklistGuard)
@Controller('inventory')
export class InventoryController {
    constructor(@Inject('INVENTORY_SERVICE') private readonly inventoryClient: ClientProxy ) {}

    @Roles('ADMIN', 'INVENTORY_MANAGER')
    @Post('reducestock')
    reduceStock(@Body() body: ReduceStockDto) {
        return this.inventoryClient.send({ cmd: 'reduce_stock' }, body);
    }

    @Roles('ADMIN', 'INVENTORY_MANAGER')
    @Post('releasestock')
    releaseStock(@Body() body: ReleaseStockDto) {
        return this.inventoryClient.send({ cmd: 'release_stock' }, body);
    }

    @Roles('ADMIN', 'INVENTORY_MANAGER')
    @Post('reservestock')
    reserveStock(@Body() body: ReserveStockDto) {
        return this.inventoryClient.send({ cmd: 'reserve_stock' }, body);
    }

    @Roles('ADMIN', 'INVENTORY_MANAGER')
    @Post('addstock')
    addStock(@Body() body: AddStockDto) {
        return this.inventoryClient.send({ cmd: 'add_stock' }, body);
    }

    @Public()
    @Get('getavailableproducts')
    getAvailableProducts() {
        return this.inventoryClient.send({ cmd: 'get_available_products' }, {});
    }

    @Public()
    @Get('getinventoryforproduct/:id')
    getInventoryForProduct(@Param('id') id: string) {
        return this.inventoryClient.send({ cmd: 'get_inventory_for_product' }, { id });
    }

    @Roles('ADMIN', 'INVENTORY_MANAGER')
    @Post('createinventory')
    createInventory(@Body() body: CreateInventoryDto) {
        return this.inventoryClient.send({ cmd: 'create_inventory' }, body);
    }

    @Roles('ADMIN', 'INVENTORY_MANAGER')
    @Patch('updateinventory/:productId')
    updateInventory(@Param('productId') productId: string, @Body() body: UpdateInventoryDto) {
        return this.inventoryClient.send({ cmd: 'update_inventory' }, { productId, ...body });
    }
}
