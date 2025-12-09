import { Controller, Get } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreateInventoryDto, UpdateInventoryDto, AddStockDto, ReduceStockDto, ReleaseStockDto, ReserveStockDto } from '@apps/common';

@Controller()
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}


  @MessagePattern({ cmd: 'create_inventory' })
  createInventory(@Payload() createInventoryDto: CreateInventoryDto){
    return this.inventoryService.createInventory(createInventoryDto);
  }

  @MessagePattern({ cmd: 'update_inventory' })
  updateInventory(@Payload() payload: {productId:string} & UpdateInventoryDto){
    const { productId, ...updateInventoryDto } = payload;
    return this.inventoryService.updateInventory(productId, updateInventoryDto);
  }

  @MessagePattern({ cmd: 'reserve_stock' })
  reserveStock(@Payload() reserveStockDto: ReserveStockDto){
    return this.inventoryService.reserveStock(reserveStockDto);
  }

  @MessagePattern({ cmd: 'release_stock' })
  releaseStock(@Payload() releaseStockDto: ReleaseStockDto){
    return this.inventoryService.releaseStock(releaseStockDto);
  }

  @MessagePattern({cmd: 'reduce_stock'})
  reduceStock(@Payload() reduceStockDto: ReduceStockDto){
    return this.inventoryService.reduceStock(reduceStockDto);
  }

  @MessagePattern({cmd: 'add_stock'})
  addStock(@Payload() addStockDto: AddStockDto){
    return this.inventoryService.addStock(addStockDto);
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
