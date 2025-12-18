import { Test, TestingModule } from '@nestjs/testing';
import { CartService } from './cart.service';
import { IdempotencyService } from '@apps/common';

describe('CartService', () => {
  let service: CartService;
  let redisClient: any;
  let idempotencyService: jest.Mocked<IdempotencyService>;

  const mockRedisClient = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    exists: jest.fn(),
  };

  const mockIdempotencyService = {
    checkIdempotency: jest.fn(),
    markCompleted: jest.fn(),
    execute: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        {
          provide: 'REDIS_CLIENT',
          useValue: mockRedisClient,
        },
        {
          provide: IdempotencyService,
          useValue: mockIdempotencyService,
        },
      ],
    }).compile();

    service = module.get<CartService>(CartService);
    redisClient = module.get('REDIS_CLIENT');
    idempotencyService = module.get(IdempotencyService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('updateCartItem', () => {
    it('should add a new item to cart', async () => {
      const cart = { items: [] };

      mockIdempotencyService.checkIdempotency.mockResolvedValue({
        exists: false,
        status: null,
        data: null,
      } as any);
      mockRedisClient.get.mockResolvedValue(JSON.stringify(cart));
      mockRedisClient.set.mockResolvedValue('OK');
      mockIdempotencyService.markCompleted.mockResolvedValue(undefined);

      const result = await service.updateCartItem('user-1', 'product-1', 2, 'idempotency-key');

      expect(mockRedisClient.set).toHaveBeenCalled();
      expect(result.items).toHaveLength(1);
      expect(result.items[0].productId).toBe('product-1');
      expect(result.items[0].quantity).toBe(2);
    });

    it('should update existing item quantity in cart', async () => {
      const cart = {
        items: [{ productId: 'product-1', quantity: 2 }],
      };

      mockIdempotencyService.checkIdempotency.mockResolvedValue({
        exists: false,
        status: null,
        data: null,
      } as any);
      mockRedisClient.get.mockResolvedValue(JSON.stringify(cart));
      mockRedisClient.set.mockResolvedValue('OK');
      mockIdempotencyService.markCompleted.mockResolvedValue(undefined);

      const result = await service.updateCartItem('user-1', 'product-1', 5, 'idempotency-key');

      expect(result.items[0].quantity).toBe(5);
    });

    it('should remove item from cart when quantity is 0', async () => {
      const cart = {
        items: [
          { productId: 'product-1', quantity: 2 },
          { productId: 'product-2', quantity: 3 },
        ],
      };

      mockIdempotencyService.checkIdempotency.mockResolvedValue({
        exists: false,
        status: null,
        data: null,
      } as any);
      mockRedisClient.get.mockResolvedValue(JSON.stringify(cart));
      mockRedisClient.set.mockResolvedValue('OK');
      mockIdempotencyService.markCompleted.mockResolvedValue(undefined);

      const result = await service.updateCartItem('user-1', 'product-1', 0, 'idempotency-key');

      expect(result.items).toHaveLength(1);
      expect(result.items[0].productId).toBe('product-2');
    });

    it('should return cached result if idempotency key exists', async () => {
      const cachedData = {
        items: [{ productId: 'product-1', quantity: 2 }],
      };

      mockIdempotencyService.checkIdempotency.mockResolvedValue({
        exists: true,
        status: 'completed',
        data: cachedData,
      } as any);

      const result = await service.updateCartItem('user-1', 'product-1', 2, 'idempotency-key');

      expect(result).toEqual(cachedData);
      expect(mockRedisClient.get).not.toHaveBeenCalled();
    });
  });

  describe('getCart', () => {
    it('should retrieve user cart', async () => {
      const cart = {
        items: [{ productId: 'product-1', quantity: 2 }],
      };

      mockRedisClient.get.mockResolvedValue(JSON.stringify(cart));

      const result = await service.getCart('user-1');

      expect(mockRedisClient.get).toHaveBeenCalledWith('cart:user-1');
      expect(result).toEqual(cart);
    });

    it('should return empty cart if cart does not exist', async () => {
      mockRedisClient.get.mockResolvedValue(null);

      const result = await service.getCart('user-1');

      expect(result).toEqual({ items: [] });
    });
  });

  describe('clearCart', () => {
    it('should clear user cart', async () => {
      mockIdempotencyService.checkIdempotency.mockResolvedValue({
        exists: false,
        status: null,
        data: null,
      } as any);
      mockIdempotencyService.markCompleted.mockResolvedValue(undefined);
      mockRedisClient.del.mockResolvedValue(1);

      const result = await service.clearCart('user-1', 'idempotency-key');

      expect(mockRedisClient.del).toHaveBeenCalledWith('cart:user-1');
      expect(result).toEqual({ message: 'Cart cleared' });
    });
  });

  describe('removeFromCart', () => {
    it('should remove an item from cart', async () => {
      const cart = {
        items: [
          { productId: 'product-1', quantity: 2 },
          { productId: 'product-2', quantity: 3 },
        ],
      };

      mockIdempotencyService.checkIdempotency.mockResolvedValue({
        exists: false,
        status: null,
        data: null,
      } as any);
      mockIdempotencyService.markCompleted.mockResolvedValue(undefined);
      mockRedisClient.get.mockResolvedValue(JSON.stringify(cart));
      mockRedisClient.set.mockResolvedValue('OK');

      const result = await service.removeFromCart('user-1', 'product-1', 'idempotency-key');

      expect(result.items).toHaveLength(1);
      expect(result.items[0].productId).toBe('product-2');
    });

    it('should return cart as-is if item does not exist', async () => {
      const cart = {
        items: [{ productId: 'product-1', quantity: 2 }],
      };

      mockIdempotencyService.checkIdempotency.mockResolvedValue({
        exists: false,
        status: null,
        data: null,
      } as any);
      mockIdempotencyService.markCompleted.mockResolvedValue(undefined);
      mockRedisClient.get.mockResolvedValue(JSON.stringify(cart));
      mockRedisClient.set.mockResolvedValue('OK');

      const result = await service.removeFromCart('user-1', 'product-999', 'idempotency-key');

      expect(result.items).toHaveLength(1);
      expect(result.items[0].productId).toBe('product-1');
    });
  });
});
