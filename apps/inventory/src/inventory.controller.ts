import { Controller, Get } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreateInventoryDto, UpdateInventoryDto, AddStockDto, ReduceStockDto, ReleaseStockDto, ReserveStockDto } from '@apps/common';

@Controller()
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}


  @MessagePattern({ cmd: 'create_inventory' })
  createInventory(@Payload() data : {createInventoryDto: CreateInventoryDto, idempotencyKey: string}){
    return this.inventoryService.createInventory(data.createInventoryDto, data.idempotencyKey);
  }

  @MessagePattern({ cmd: 'update_inventory' })
  updateInventory(@Payload() payload: {productId:string,  updateInventoryDto: UpdateInventoryDto, idempotencyKey: string}){
    const { productId, ...updateInventoryDto } = payload;
    return this.inventoryService.updateInventory(payload.productId, payload.updateInventoryDto, payload.idempotencyKey);
  }

  @MessagePattern({ cmd: 'reserve_stock' })
  reserveStock(@Payload() data: {reserveStockDto: ReserveStockDto, idempotencyKey: string}){
    return this.inventoryService.reserveStock(data.reserveStockDto, data.idempotencyKey);
  }

  @MessagePattern({ cmd: 'release_stock' })
  releaseStock(@Payload() data: {releaseStockDto: ReleaseStockDto, idempotencyKey: string }){
    return this.inventoryService.releaseStock(data.releaseStockDto, data.idempotencyKey);
  }

  @MessagePattern({ cmd: 'reduce_stock' })
  reduceStock(@Payload() data: { dto: ReduceStockDto; idempotencyKey: string }) {
    return this.inventoryService.reduceStock(data.dto, data.idempotencyKey);
  }

  @MessagePattern({cmd: 'add_stock'})
  addStock(@Payload() data:{addStockDto: AddStockDto, idempotencyKey: string}){
    return this.inventoryService.addStock(data.addStockDto, data.idempotencyKey);
  }

  @MessagePattern({cmd: 'get_inventory_for_product'})
  getInventoryForProduct(@Payload() payload: { id: string }){
    return this.inventoryService.getInventoryForProduct(payload.id);
  }

  @MessagePattern({cmd: 'get_available_products'})
  getAvailableProducts(){
    return this.inventoryService.getAvailableProducts();
  }
}
