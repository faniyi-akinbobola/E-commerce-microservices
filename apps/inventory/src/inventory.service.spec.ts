import { Test, TestingModule } from '@nestjs/testing';
import { InventoryService } from './inventory.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Inventory } from './entities/inventory.entity';
import { Product } from '../../product/src/entities/product.entity';
import { Repository, DataSource } from 'typeorm';
import { RpcException } from '@nestjs/microservices';
import { IdempotencyService } from '@apps/common';
import { ObjectId } from 'mongodb';

describe('InventoryService', () => {
  let service: InventoryService;
  let inventoryRepository: jest.Mocked<Repository<Inventory>>;
  let productRepository: jest.Mocked<Repository<Product>>;
  let idempotencyService: jest.Mocked<IdempotencyService>;

  const mockInventory = {
    id: 'inventory-1',
    productId: 'product-1',
    quantity: 100,
    reserved: 0,
    available: 100,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockInventoryRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    update: jest.fn(),
  };

  const mockProductRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    save: jest.fn(),
  };

  const mockIdempotencyService = {
    execute: jest.fn(),
    checkIdempotency: jest.fn().mockResolvedValue({
      exists: false,
      status: null,
      data: null,
    }),
    markCompleted: jest.fn(),
    markFailed: jest.fn(),
  };

  const mockQueryRunner = {
    connect: jest.fn(),
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
    manager: {
      save: jest.fn(),
      findOne: jest.fn(),
    },
  };

  const mockDataSource = {
    createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
    transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryService,
        {
          provide: getRepositoryToken(Inventory, 'default'),
          useValue: mockInventoryRepository,
        },
        {
          provide: getRepositoryToken(Product, 'mongodb'),
          useValue: mockProductRepository,
        },
        {
          provide: IdempotencyService,
          useValue: mockIdempotencyService,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<InventoryService>(InventoryService);
    inventoryRepository = module.get(getRepositoryToken(Inventory, 'default'));
    productRepository = module.get(getRepositoryToken(Product, 'mongodb'));
    idempotencyService = module.get(IdempotencyService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createInventory', () => {
    it('should create inventory for a product', async () => {
      const dto = {
        productId: 'product-1',
        quantity: 100,
      };

      mockQueryRunner.manager.findOne.mockResolvedValue(null);
      mockQueryRunner.manager.save.mockResolvedValue(mockInventory as any);
      mockIdempotencyService.markCompleted.mockResolvedValue(undefined);

      const result = await service.createInventory(dto as any, 'idempotency-key');

      expect(mockQueryRunner.manager.save).toHaveBeenCalled();
      expect(result).toEqual(mockInventory);
    });

    it('should throw error if inventory already exists', async () => {
      const dto = {
        productId: 'product-1',
        quantity: 100,
      };

      mockQueryRunner.manager.findOne.mockResolvedValue(mockInventory as any);

      await expect(service.createInventory(dto as any, 'idempotency-key')).rejects.toThrow(
        RpcException,
      );
    });
  });

  describe('getInventoryForProduct', () => {
    it('should retrieve inventory for a product', async () => {
      mockInventoryRepository.findOne.mockResolvedValue(mockInventory as any);

      const result = await service.getInventoryForProduct('product-1');

      expect(mockInventoryRepository.findOne).toHaveBeenCalledWith({
        where: { productId: 'product-1' },
      });
      expect(result).toEqual(mockInventory);
    });

    it('should throw error if inventory not found', async () => {
      mockInventoryRepository.findOne.mockResolvedValue(null);

      await expect(service.getInventoryForProduct('product-999')).rejects.toThrow(RpcException);
    });
  });

  describe('updateInventory', () => {
    it('should update inventory quantity', async () => {
      const dto = {
        quantity: 150,
      };

      mockQueryRunner.manager.findOne.mockResolvedValue(mockInventory as any);
      mockQueryRunner.manager.save.mockResolvedValue({
        ...mockInventory,
        quantity: 150,
        available: 150,
      } as any);
      mockIdempotencyService.markCompleted.mockResolvedValue(undefined);

      const result = await service.updateInventory('product-1', dto as any, 'idempotency-key');

      expect(mockQueryRunner.manager.save).toHaveBeenCalled();
      expect(result.quantity).toBe(150);
    });

    it('should throw error if inventory not found', async () => {
      const dto = {
        quantity: 150,
      };

      mockQueryRunner.manager.findOne.mockResolvedValue(null);

      await expect(
        service.updateInventory('product-999', dto as any, 'idempotency-key'),
      ).rejects.toThrow(RpcException);
    });
  });

  describe('addStock', () => {
    it('should add stock to inventory', async () => {
      const validProductId = new ObjectId().toString();
      const dto = {
        productId: validProductId,
        quantity: 50,
      };

      const mockProduct = {
        _id: new ObjectId(validProductId),
        name: 'Test Product',
        price: 100,
        stock: 100,
      };

      const mockProductAfterUpdate = {
        ...mockProduct,
        stock: 150,
      };

      mockQueryRunner.manager.findOne.mockResolvedValueOnce(mockInventory as any);
      mockProductRepository.findOne.mockResolvedValue(mockProduct as any);
      mockProductRepository.save.mockResolvedValue(mockProductAfterUpdate as any);
      mockQueryRunner.manager.save.mockResolvedValue(mockInventory as any);
      mockIdempotencyService.markCompleted.mockResolvedValue(undefined);

      const result = await service.addStock(dto as any, 'idempotency-key');

      expect(mockProductRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockProductAfterUpdate);
    });
  });

  describe('reduceStock', () => {
    it('should reduce stock from inventory', async () => {
      const validProductId = new ObjectId().toString();
      const dto = {
        productId: validProductId,
        quantity: 20,
      };

      const mockInventoryWithStock = {
        ...mockInventory,
        productId: validProductId,
        quantity: 200,
        reserved: 20,
        available: 180,
      };

      const mockProduct = {
        _id: new ObjectId(validProductId),
        name: 'Test Product',
        price: 100,
        stock: 200,
      };

      const mockProductAfterReduce = {
        ...mockProduct,
        stock: 180,
      };

      mockQueryRunner.manager.findOne.mockResolvedValueOnce(mockInventoryWithStock as any);
      mockProductRepository.findOne.mockResolvedValue(mockProduct as any);
      mockProductRepository.save.mockResolvedValue(mockProductAfterReduce as any);
      mockQueryRunner.manager.save.mockResolvedValue(mockInventoryWithStock as any);
      mockIdempotencyService.markCompleted.mockResolvedValue(undefined);

      const result = await service.reduceStock(dto as any, 'idempotency-key');

      expect(mockProductRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockProductAfterReduce);
    });

    it('should throw error if insufficient stock', async () => {
      const validProductId = new ObjectId().toString();
      const dto = {
        productId: validProductId,
        quantity: 200,
      };

      const mockInventoryLowStock = {
        ...mockInventory,
        productId: validProductId,
        quantity: 100,
        reserved: 0,
        available: 100,
      };

      mockQueryRunner.manager.findOne.mockResolvedValue(mockInventoryLowStock as any);

      await expect(service.reduceStock(dto as any, 'idempotency-key')).rejects.toThrow(
        RpcException,
      );
    });
  });

  describe('getAvailableProducts', () => {
    it('should retrieve all products with available stock', async () => {
      const mockProductIdObjectId = new ObjectId();
      const inventories = [
        {
          ...mockInventory,
          productId: mockProductIdObjectId.toString(),
          isActive: true,
        },
      ];
      const mockProducts = [
        {
          _id: mockProductIdObjectId,
          name: 'Test Product',
          price: 100,
        },
      ];

      mockInventoryRepository.find.mockResolvedValue(inventories as any);
      mockProductRepository.find.mockResolvedValue(mockProducts as any);

      const result = await service.getAvailableProducts();

      expect(mockInventoryRepository.find).toHaveBeenCalledWith({ where: { isActive: true } });
      expect(mockProductRepository.find).toHaveBeenCalled();
      expect(result).toEqual(mockProducts);
    });
  });
});
