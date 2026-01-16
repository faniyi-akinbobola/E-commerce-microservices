import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Inventory } from './entities/inventory.entity';
import { Repository, DataSource, In } from 'typeorm';
import {
  CreateInventoryDto,
  UpdateInventoryDto,
  AddStockDto,
  ReduceStockDto,
  ReleaseStockDto,
  ReserveStockDto,
  IdempotencyService,
} from '@apps/common';
import { RpcException } from '@nestjs/microservices';
import { Product } from '../../product/src/entities/product.entity';
import { ObjectId } from 'mongodb';
import { query } from 'express';
import { QueryExpressionMap } from 'typeorm/query-builder/QueryExpressionMap';
import { queryObjects } from 'v8';

@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name);

  constructor(
    @InjectRepository(Inventory, 'default')
    private inventoryRepository: Repository<Inventory>,
    @InjectRepository(Product, 'mongodb')
    private productRepository: Repository<Product>,
    private readonly dataSource: DataSource, // For transactions and row locking
    private readonly idempotencyService: IdempotencyService, // Inject idempotency service
  ) {}

  async addStock(addStockDto: AddStockDto, idempotencyKey: string): Promise<any> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const idempotencyCheck = await this.idempotencyService.checkIdempotency(
        idempotencyKey,
        'inventory-service',
        'inventory/addstock',
        addStockDto,
      );

      if (idempotencyCheck.exists && idempotencyCheck.status === 'completed') {
        await queryRunner.release();
        return idempotencyCheck.data;
      }

      if (idempotencyCheck.exists && idempotencyCheck.status === 'pending') {
        await queryRunner.release();
        throw new RpcException('Request is already being processed. Please wait.');
      }

      // Lock inventory row (PostgreSQL)
      const inventory = await queryRunner.manager.findOne(Inventory, {
        where: { productId: addStockDto.productId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!inventory) {
        await queryRunner.rollbackTransaction();
        await queryRunner.release();
        throw new RpcException('Inventory not found for this product');
      }

      // Update inventory
      inventory.quantity += addStockDto.quantity;
      inventory.updatedAt = new Date();
      const updatedInventory = await queryRunner.manager.save(Inventory, inventory);

      // Update product in MongoDB (separate from transaction)
      const product = await this.productRepository.findOne({
        where: { _id: new ObjectId(addStockDto.productId) } as any,
      });

      if (!product) {
        await queryRunner.rollbackTransaction();
        await queryRunner.release();
        throw new RpcException('Product not found');
      }

      product.stock += addStockDto.quantity;
      await this.productRepository.save(product);

      const response = {
        statusCode: 200,
        timestamp: new Date().toISOString(),
        data: {
          ...updatedInventory,
          productName: product?.name || null,
        },
      };

      await this.idempotencyService.markCompleted(
        idempotencyKey,
        'inventory-service',
        'inventory/addstock',
        addStockDto,
        response,
        200,
      );

      await queryRunner.commitTransaction();
      await queryRunner.release();

      return response;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();

      await this.idempotencyService.markFailed(
        idempotencyKey,
        'inventory-service',
        'inventory/addstock',
        error.message || 'Failed to add stock.',
      );

      throw error;
    }
  }

  async reduceStock(reduceStockDto: ReduceStockDto, idempotencyKey: string): Promise<any> {
    // Create a query runner for transaction management
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // ===== STEP 1: CHECK IDEMPOTENCY =====
      // Check if this request has already been processed
      const idempotencyCheck = await this.idempotencyService.checkIdempotency(
        idempotencyKey,
        'inventory-service',
        '/inventory/reduce-stock',
        reduceStockDto,
      );

      // If already completed, return cached result
      if (idempotencyCheck.exists && idempotencyCheck.status === 'completed') {
        this.logger.log(`Returning cached result for idempotency key: ${idempotencyKey}`);
        await queryRunner.release();
        return idempotencyCheck.data;
      }

      // If request is pending (concurrent request), throw error
      if (idempotencyCheck.exists && idempotencyCheck.status === 'pending') {
        this.logger.warn(`Concurrent request detected for idempotency key: ${idempotencyKey}`);
        await queryRunner.release();
        throw new RpcException('Request is already being processed. Please wait.');
      }

      // ===== STEP 2: LOCK THE INVENTORY ROW =====
      // Use pessimistic write lock to prevent concurrent modifications
      const inventory = await queryRunner.manager.findOne(Inventory, {
        where: { productId: reduceStockDto.productId },
        lock: { mode: 'pessimistic_write' }, // ✅ Exclusive lock - no other transaction can read/write
      });

      if (!inventory) {
        await queryRunner.rollbackTransaction();
        await queryRunner.release();
        throw new RpcException('Inventory not found');
      }

      // ===== STEP 3: VALIDATE STOCK AVAILABILITY =====
      if (inventory.quantity < reduceStockDto.quantity) {
        await queryRunner.rollbackTransaction();
        await queryRunner.release();
        throw new RpcException(
          `Insufficient stock. Available: ${inventory.quantity}, Requested: ${reduceStockDto.quantity}`,
        );
      }

      // ===== STEP 4: REDUCE STOCK (while holding the lock) =====
      inventory.quantity -= reduceStockDto.quantity;
      inventory.updatedAt = new Date();

      // Save the updated inventory within the transaction
      const updatedInventory = await queryRunner.manager.save(Inventory, inventory);

      this.logger.log(
        `Stock reduced for product ${reduceStockDto.productId}: ${reduceStockDto.quantity} units`,
      );

      // ===== STEP 5: UPDATE PRODUCT COLLECTION (MongoDB) =====
      // Note: MongoDB doesn't support the same transaction as PostgreSQL
      // For production, consider using MongoDB transactions or saga pattern
      const product = await this.productRepository.findOne({
        where: { _id: new ObjectId(reduceStockDto.productId) } as any,
      });

      if (!product) {
        await queryRunner.rollbackTransaction();
        await queryRunner.release();
        throw new RpcException('Product not found');
      }

      if (product.stock < reduceStockDto.quantity) {
        await queryRunner.rollbackTransaction();
        await queryRunner.release();
        throw new RpcException('Insufficient product stock');
      }

      product.stock -= reduceStockDto.quantity;
      await this.productRepository.save(product);

      const response = {
        statusCode: 200,
        timestamp: new Date().toISOString(),
        data: {
          ...updatedInventory,
          productName: product?.name || null,
        },
      };

      // ===== STEP 6: MARK IDEMPOTENCY AS COMPLETED =====
      await this.idempotencyService.markCompleted(
        idempotencyKey,
        'inventory-service',
        '/inventory/reduce-stock',
        reduceStockDto,
        response,
        200,
      );

      // ===== STEP 7: COMMIT TRANSACTION (releases the lock) =====
      await queryRunner.commitTransaction();
      await queryRunner.release();

      return response;
    } catch (error) {
      // ===== ROLLBACK ON ERROR (releases the lock) =====
      await queryRunner.rollbackTransaction();
      await queryRunner.release();

      // Mark as failed to allow retry
      await this.idempotencyService.markFailed(
        idempotencyKey,
        'inventory-service',
        '/inventory/reduce-stock',
        error.message || 'Failed to reduce stock',
      );

      this.logger.error(`Failed to reduce stock: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getAvailableProducts(): Promise<Product[]> {
    const inventory = await this.inventoryRepository.find({ where: { isActive: true } });

    if (!inventory || inventory.length === 0) {
      return [];
    }

    const productIds = inventory.map((inv) => inv.productId).filter((id) => id && id.length === 24); // Filter valid MongoDB ObjectId strings

    if (productIds.length === 0) {
      return [];
    }

    try {
      const objectIds = productIds.map((id) => new ObjectId(id));
      const products = await this.productRepository.find({
        where: { _id: { $in: objectIds } } as any,
      });

      // Create a map of productId to inventory for quick lookup
      const inventoryMap = new Map(inventory.map((inv) => [inv.productId, inv]));

      // Merge inventory quantity into product stock
      const productsWithInventory = products.map((product) => {
        const inv = inventoryMap.get(product._id.toString());
        if (inv) {
          // Update the product's stock with the actual inventory quantity
          return {
            ...product,
            stock: inv.quantity - inv.reserved, // Available stock = quantity - reserved
          };
        }
        return product;
      });

      return productsWithInventory || [];
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  }

  async getInventoryForProduct(id: string): Promise<any> {
    const inventory = await this.inventoryRepository.findOne({ where: { productId: id } });
    if (!inventory) {
      throw new RpcException('Inventory not found for this product');
    }

    // Fetch product name
    const product = await this.productRepository.findOne({
      where: { _id: new ObjectId(id) } as any,
    });

    return {
      statusCode: 200,
      timestamp: new Date().toISOString(),
      data: {
        ...inventory,
        productName: product?.name || null,
      },
    };
  }

  async releaseStock(releaseStockDto: ReleaseStockDto, idempotencyKey: string): Promise<any> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const idempotencyCheck = await this.idempotencyService.checkIdempotency(
        idempotencyKey,
        'inventory-service',
        'inventory/releaseStock',
        releaseStockDto,
      );

      if (idempotencyCheck.exists && idempotencyCheck.status === 'completed') {
        await queryRunner.release();
        return idempotencyCheck.data;
      }

      if (idempotencyCheck.exists && idempotencyCheck.status === 'pending') {
        await queryRunner.release();
        throw new RpcException('Request is already being processed. Please wait.');
      }

      const inventory = await queryRunner.manager.findOne(Inventory, {
        where: { productId: releaseStockDto.productId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!inventory) {
        await queryRunner.rollbackTransaction();
        await queryRunner.release();
        throw new RpcException('Inventory not found');
      }

      if ((inventory.reserved || 0) < releaseStockDto.quantity) {
        await queryRunner.rollbackTransaction();
        await queryRunner.release();
        throw new RpcException('Insufficient reserved stock to release');
      }

      inventory.quantity += releaseStockDto.quantity;
      inventory.reserved -= releaseStockDto.quantity;
      inventory.updatedAt = new Date();

      const savedInventory = await queryRunner.manager.save(Inventory, inventory);

      // Fetch product name
      const product = await this.productRepository.findOne({
        where: { _id: new ObjectId(releaseStockDto.productId) } as any,
      });

      const response = {
        statusCode: 200,
        timestamp: new Date().toISOString(),
        data: {
          ...savedInventory,
          productName: product?.name || null,
        },
      };

      await this.idempotencyService.markCompleted(
        idempotencyKey,
        'inventory-service',
        'inventory/releaseStock',
        releaseStockDto,
        response,
        200,
      );

      await queryRunner.commitTransaction();
      await queryRunner.release();

      return response;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();

      await this.idempotencyService.markFailed(
        idempotencyKey,
        'inventory-service',
        'inventory/releaseStock',
        error.message || 'Failed to release stock',
      );

      throw error;
    }
  }

  async reserveStock(reserveStockDto: ReserveStockDto, idempotencyKey: string): Promise<any> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const idempotencyCheck = await this.idempotencyService.checkIdempotency(
        idempotencyKey,
        'inventory-service',
        'inventory/reserveStock',
        reserveStockDto,
      );

      if (idempotencyCheck.exists && idempotencyCheck.status === 'completed') {
        await queryRunner.release();
        return idempotencyCheck.data;
      }

      if (idempotencyCheck.exists && idempotencyCheck.status === 'pending') {
        await queryRunner.release();
        throw new RpcException('Request is already being processed. Please wait.');
      }

      const inventory = await queryRunner.manager.findOne(Inventory, {
        where: { productId: reserveStockDto.productId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!inventory) {
        await queryRunner.rollbackTransaction();
        await queryRunner.release();
        throw new RpcException('Inventory not found');
      }

      if (inventory.quantity < reserveStockDto.quantity) {
        await queryRunner.rollbackTransaction();
        await queryRunner.release();
        throw new RpcException('Insufficient stock to reserve');
      }

      inventory.quantity -= reserveStockDto.quantity;
      inventory.reserved = (inventory.reserved || 0) + reserveStockDto.quantity;
      inventory.updatedAt = new Date();

      const reservedStock = await queryRunner.manager.save(Inventory, inventory);

      // Fetch product name
      const product = await this.productRepository.findOne({
        where: { _id: new ObjectId(reserveStockDto.productId) } as any,
      });

      const response = {
        statusCode: 200,
        timestamp: new Date().toISOString(),
        data: {
          ...reservedStock,
          productName: product?.name || null,
        },
      };

      await this.idempotencyService.markCompleted(
        idempotencyKey,
        'inventory-service',
        'inventory/reserveStock',
        reserveStockDto,
        response,
        200,
      );

      await queryRunner.commitTransaction();
      await queryRunner.release();

      return response;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();

      await this.idempotencyService.markFailed(
        idempotencyKey,
        'inventory-service',
        'inventory/reserveStock',
        error.message || 'Failed to reserve stock.',
      );

      throw error;
    }
  }

  async updateInventory(
    productId: string,
    updateInventoryDto: UpdateInventoryDto,
    idempotencyKey: string,
  ): Promise<any> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const idempotencyCheck = await this.idempotencyService.checkIdempotency(
        idempotencyKey,
        'inventory-service',
        'inventory/updateInventory',
        updateInventoryDto,
      );

      if (idempotencyCheck.exists && idempotencyCheck.status === 'completed') {
        await queryRunner.release();
        return idempotencyCheck.data;
      }

      if (idempotencyCheck.exists && idempotencyCheck.status === 'pending') {
        await queryRunner.release();
        throw new RpcException('Request is already being processed. Please wait.');
      }

      const inventory = await queryRunner.manager.findOne(Inventory, {
        where: { productId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!inventory) {
        await queryRunner.rollbackTransaction();
        await queryRunner.release();
        throw new RpcException('Inventory not found');
      }

      Object.assign(inventory, { ...updateInventoryDto, updatedAt: new Date() });

      const updatedInventory = await queryRunner.manager.save(Inventory, inventory);

      // Fetch product name
      const product = await this.productRepository.findOne({
        where: { _id: new ObjectId(productId) } as any,
      });

      const response = {
        statusCode: 200,
        timestamp: new Date().toISOString(),
        data: {
          ...updatedInventory,
          productName: product?.name || null,
        },
      };

      await this.idempotencyService.markCompleted(
        idempotencyKey,
        'inventory-service',
        'inventory/updateInventory',
        updateInventoryDto,
        response,
        200,
      );

      await queryRunner.commitTransaction();
      await queryRunner.release();

      return response;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();

      await this.idempotencyService.markFailed(
        idempotencyKey,
        'inventory-service',
        'inventory/updateInventory',
        error.message || 'Failed to update inventory.',
      );

      throw error;
    }
  }

  async createInventory(
    createInventoryDto: CreateInventoryDto,
    idempotencyKey: string,
  ): Promise<any> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const idempotencyCheck = await this.idempotencyService.checkIdempotency(
        idempotencyKey,
        'inventory-service',
        'inventory/createInventory',
        createInventoryDto,
      );

      if (idempotencyCheck.exists && idempotencyCheck.status === 'completed') {
        await queryRunner.release();
        return idempotencyCheck.data;
      }

      if (idempotencyCheck.exists && idempotencyCheck.status === 'pending') {
        await queryRunner.release();
        throw new RpcException('Request is already being processed. Please wait.');
      }

      const inventory = await queryRunner.manager.findOne(Inventory, {
        where: { productId: createInventoryDto.productId },
        lock: { mode: 'pessimistic_write' },
      });

      if (inventory) {
        await queryRunner.rollbackTransaction();
        await queryRunner.release();
        throw new RpcException('Inventory for this product already exists');
      }

      const newInventory = this.inventoryRepository.create({
        ...createInventoryDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const newInventoryCreated = await queryRunner.manager.save(Inventory, newInventory);

      // Fetch product name
      const product = await this.productRepository.findOne({
        where: { _id: new ObjectId(createInventoryDto.productId) } as any,
      });

      const response = {
        statusCode: 201,
        timestamp: new Date().toISOString(),
        data: {
          ...newInventoryCreated,
          productName: product?.name || null,
        },
      };

      await this.idempotencyService.markCompleted(
        idempotencyKey,
        'inventory-service',
        'inventory/createInventory',
        createInventoryDto,
        response,
        200,
      );

      await queryRunner.commitTransaction();
      await queryRunner.release();

      return response;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();

      await this.idempotencyService.markFailed(
        idempotencyKey,
        'inventory-service',
        'inventory/createInventory',
        error.message || 'Failed to create inventory.',
      );

      throw error;
    }
  }
}
