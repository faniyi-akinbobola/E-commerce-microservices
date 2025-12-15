import { Injectable,Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Inventory } from './entities/inventory.entity';
import { Repository } from 'typeorm';
import { CreateInventoryDto, UpdateInventoryDto, AddStockDto, ReduceStockDto, ReleaseStockDto, ReserveStockDto } from '@apps/common';
import { RpcException } from '@nestjs/microservices';
import { Product } from 'apps/product/src/entities/product.entity';
import { ObjectId } from 'mongodb';

@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name);


  constructor(
    @InjectRepository(Inventory, 'default') 
    private inventoryRepository: Repository<Inventory>,
    @InjectRepository(Product, 'mongodb') 
    private productRepository: Repository<Product>
  ) {}

  async addStock(addStockDto: AddStockDto): Promise<Product> {
    const product = await this.productRepository.findOne({where: {_id: new ObjectId(addStockDto.productId)} as any});
    if (!product) {
      throw new RpcException('Product not found');
    }
    product.stock += addStockDto.quantity;
    return this.productRepository.save(product);
  }

  async reduceStock(reduceStockDto: ReduceStockDto): Promise<Product> {
    const product = await this.productRepository.findOne({where: {_id: new ObjectId(reduceStockDto.productId)} as any});
    if (!product) {
      throw new RpcException('Product not found');
    }
    if (product.stock < reduceStockDto.quantity) {
      throw new RpcException('Insufficient stock to reduce');
    }
    product.stock -= reduceStockDto.quantity;
    return this.productRepository.save(product);
  }

  async getAvailableProducts(): Promise<Product[]> {
    const inventory = await this.inventoryRepository.find({where: {isActive: true}});
    
    if (!inventory || inventory.length === 0) {
      return [];
    }
    
    const productIds = inventory
      .map(inv => inv.productId)
      .filter(id => id && id.length === 24); // Filter valid MongoDB ObjectId strings
    
    if (productIds.length === 0) {
      return [];
    }
    
    try {
      const objectIds = productIds.map(id => new ObjectId(id));
      const products = await this.productRepository.find({where: { _id: { $in: objectIds } } as any});
      return products || [];
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  }

  async getInventoryForProduct(id : string): Promise<Inventory>  {
    const inventory = await this.inventoryRepository.findOne({where: {productId: id}});
    if (!inventory) {
      throw new RpcException('Inventory not found for this product');
    }
    return inventory;
  }

  async releaseStock(releaseStockDto: ReleaseStockDto): Promise<Inventory> {
    const inventory = await this.inventoryRepository.findOne({ where: { productId: releaseStockDto.productId } });
    if (!inventory) {
      throw new RpcException('Inventory not found');
    }
    if ((inventory.reserved || 0) < releaseStockDto.quantity) {
      throw new RpcException('Insufficient reserved stock to release');
    }
    inventory.quantity += releaseStockDto.quantity;
    inventory.reserved -= releaseStockDto.quantity;
    inventory.updatedAt = new Date();
    return this.inventoryRepository.save(inventory);
  }

  async reserveStock(reserveStockDto: ReserveStockDto): Promise<Inventory> {
    const inventory = await this.inventoryRepository.findOne({ where: { productId: reserveStockDto.productId } });
    if (!inventory) {
      throw new RpcException('Inventory not found');
    }
    if (inventory.quantity < reserveStockDto.quantity) {
      throw new RpcException('Insufficient stock to reserve');
    }
    inventory.quantity -= reserveStockDto.quantity;
    inventory.reserved = (inventory.reserved || 0) + reserveStockDto.quantity;
    inventory.updatedAt = new Date();
    return this.inventoryRepository.save(inventory);
  }

  async updateInventory(productId: string, updateInventoryDto: UpdateInventoryDto): Promise<Inventory> {
    const inventory = await this.inventoryRepository.findOne({where: {productId}});
    if (!inventory) {
      throw new RpcException('Inventory not found');
    }
    Object.assign(inventory, {...updateInventoryDto, updatedAt: new Date()});
    return this.inventoryRepository.save(inventory);
  }

  async createInventory(createInventoryDto: CreateInventoryDto): Promise<Inventory> {
  const inventory = await this.inventoryRepository.findOne({ where: { productId: createInventoryDto.productId } });
  if (inventory) {
    throw new RpcException('Inventory for this product already exists');
  }
  const newInventory = this.inventoryRepository.create({
    ...createInventoryDto,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  return this.inventoryRepository.save(newInventory);
}

}