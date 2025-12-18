import { Test, TestingModule } from '@nestjs/testing';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';

describe('InventoryController', () => {
  let inventoryController: InventoryController;
  let inventoryServiceMock: jest.Mocked<InventoryService>;

  const mockService = {
    createInventory: jest.fn(),
    updateInventory: jest.fn(),
    reserveStock: jest.fn(),
    releaseStock: jest.fn(),
    reduceStock: jest.fn(),
    addStock: jest.fn(),
    getInventoryForProduct: jest.fn(),
    getAvailableProducts: jest.fn(),
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [InventoryController],
      providers: [InventoryService],
    })
      .overrideProvider(InventoryService)
      .useValue(mockService)
      .compile();

    inventoryController = app.get<InventoryController>(InventoryController);
    inventoryServiceMock = app.get(InventoryService);
  });

  describe('root', () => {
    it('should be defined', () => {
      expect(inventoryController).toBeDefined();
    });
  });

  describe('createInventory', () => {
    it('should create inventory', () => {
      const dto = { productId: 'prod1', quantity: 100 };
      const idempotencyKey = 'unique-key-123';
      inventoryController.createInventory({ createInventoryDto: dto, idempotencyKey });
      expect(inventoryServiceMock.createInventory).toHaveBeenCalledWith(dto, idempotencyKey);
    });
  });

  describe('updateInventory', () => {
    it('should update inventory', () => {
      const productId = 'prod1';
      const dto = { quantity: 150 };
      const idempotencyKey = 'unique-key-456';
      inventoryController.updateInventory({ productId, updateInventoryDto: dto, idempotencyKey });
      expect(inventoryServiceMock.updateInventory).toHaveBeenCalledWith(
        productId,
        dto,
        idempotencyKey,
      );
    });
  });

  // describe('reserveStock', () => {
  //   it('should reserve stock', () => {
  //     const dto = { productId: 'prod1', quantity: 10 };
  //     const idempotencyKey = 'unique-key-789';
  //     inventoryController.reserveStock({ reserveStockDto : dto, idempotencyKey });
  //     expect(inventoryServiceMock.reserveStock).toHaveBeenCalledWith(dto, idempotencyKey);
  //   });
  // });

  describe('releaseStock', () => {
    it('should release stock', () => {
      const dto = { productId: 'prod1', quantity: 5 };
      const idempotencyKey = 'unique-key-101';
      inventoryController.releaseStock({ releaseStockDto: dto, idempotencyKey });
      expect(inventoryServiceMock.releaseStock).toHaveBeenCalledWith(dto, idempotencyKey);
    });
  });

  describe('reduceStock', () => {
    it('should reduce stock', () => {
      const dto = { productId: 'prod1', quantity: 20 };
      const idempotencyKey = 'unique-key-102';
      inventoryController.reduceStock({ dto, idempotencyKey });
      expect(inventoryServiceMock.reduceStock).toHaveBeenCalledWith(dto, idempotencyKey);
    });
  });

  describe('addStock', () => {
    it('should add stock', () => {
      const dto = { productId: 'prod1', quantity: 30 };
      const idempotencyKey = 'unique-key-103';
      inventoryController.addStock({ addStockDto: dto, idempotencyKey });
      expect(inventoryServiceMock.addStock).toHaveBeenCalledWith(dto, idempotencyKey);
    });
  });

  describe('getInventoryForProduct', () => {
    it('should get inventory for product', () => {
      const productId = 'prod1';
      inventoryController.getInventoryForProduct({ id: productId });
      expect(inventoryServiceMock.getInventoryForProduct).toHaveBeenCalledWith(productId);
    });
  });

  describe('getAvailableProducts', () => {
    it('should get available products', () => {
      inventoryController.getAvailableProducts();
      expect(inventoryServiceMock.getAvailableProducts).toHaveBeenCalled();
    });
  });
});
