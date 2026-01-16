import { Test, TestingModule } from '@nestjs/testing';
import { OrderService } from './order.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Order, OrderStatus } from './entities/order-entity';
import { OrderItem } from './entities/order-item.entity';
import { CircuitBreakerService, IdempotencyService } from '@apps/common';
import { RpcException } from '@nestjs/microservices';
import { DataSource, Repository } from 'typeorm';
import { of } from 'rxjs';

describe('OrderService', () => {
  let service: OrderService;
  let orderRepository: jest.Mocked<Repository<Order>>;
  let orderItemRepository: jest.Mocked<Repository<OrderItem>>;
  let authClient: any;
  let cartClient: any;
  let productClient: any;
  let notificationClient: any;
  let paymentClient: any;
  let circuitBreakerService: jest.Mocked<CircuitBreakerService>;
  let idempotencyService: jest.Mocked<IdempotencyService>;
  let dataSource: jest.Mocked<DataSource>;

  const mockOrder = {
    id: 'order-1',
    userId: 'user-1',
    items: [],
    totalPrice: 100,
    subtotal: 90,
    tax: 10,
    status: OrderStatus.PENDING,
    shippingAddressId: 'addr-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockOrderRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    update: jest.fn(),
  };

  const mockOrderItemRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
  };

  const mockAuthClient = {
    send: jest.fn(),
  };

  const mockCartClient = {
    send: jest.fn(),
  };

  const mockProductClient = {
    send: jest.fn(),
  };

  const mockNotificationClient = {
    send: jest.fn(),
    emit: jest.fn(),
  };

  const mockPaymentClient = {
    send: jest.fn(),
  };

  const mockCircuitBreakerService = {
    createCircuitBreaker: jest.fn(),
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
        OrderService,
        {
          provide: getRepositoryToken(Order),
          useValue: mockOrderRepository,
        },
        {
          provide: getRepositoryToken(OrderItem),
          useValue: mockOrderItemRepository,
        },
        {
          provide: 'AUTH_SERVICE',
          useValue: mockAuthClient,
        },
        {
          provide: 'CART_SERVICE',
          useValue: mockCartClient,
        },
        {
          provide: 'PRODUCT_SERVICE',
          useValue: mockProductClient,
        },
        {
          provide: 'NOTIFICATION_SERVICE',
          useValue: mockNotificationClient,
        },
        {
          provide: 'PAYMENT_SERVICE',
          useValue: mockPaymentClient,
        },
        {
          provide: CircuitBreakerService,
          useValue: mockCircuitBreakerService,
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

    service = module.get<OrderService>(OrderService);
    orderRepository = module.get(getRepositoryToken(Order));
    orderItemRepository = module.get(getRepositoryToken(OrderItem));
    authClient = module.get('AUTH_SERVICE');
    cartClient = module.get('CART_SERVICE');
    productClient = module.get('PRODUCT_SERVICE');
    notificationClient = module.get('NOTIFICATION_SERVICE');
    paymentClient = module.get('PAYMENT_SERVICE');
    circuitBreakerService = module.get(CircuitBreakerService);
    idempotencyService = module.get(IdempotencyService);
    dataSource = module.get(DataSource);

    // Mock circuit breaker to just execute the function
    mockCircuitBreakerService.createCircuitBreaker.mockImplementation((fn: any) => {
      const mockCircuit = {
        fire: fn,
        fallback: jest.fn().mockReturnThis(),
        on: jest.fn().mockReturnThis(),
      };
      return mockCircuit;
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getOrderById', () => {
    it('should retrieve an order by ID', async () => {
      mockOrderRepository.findOne.mockResolvedValue(mockOrder as any);

      const result = await service.getOrderById('order-1');

      expect(mockOrderRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'order-1' },
        relations: ['items'],
      });
      expect(result).toEqual(mockOrder);
    });

    it('should throw an error if order not found', async () => {
      mockOrderRepository.findOne.mockResolvedValue(null);

      await expect(service.getOrderById('order-1')).rejects.toThrow(RpcException);
    });
  });

  describe('getAllOrders', () => {
    it('should retrieve all orders', async () => {
      const orders = [mockOrder];
      mockOrderRepository.find.mockResolvedValue(orders as any);

      const result = await service.getAllOrders();

      expect(mockOrderRepository.find).toHaveBeenCalledWith({
        relations: ['items'],
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(orders);
    });
  });

  describe('getUserOrders', () => {
    it('should retrieve all orders for a user', async () => {
      const orders = [mockOrder];
      mockOrderRepository.find.mockResolvedValue(orders as any);

      const result = await service.getUserOrders('user-1');

      expect(mockOrderRepository.find).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        relations: ['items'],
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(orders);
    });

    it('should return empty array if user has no orders', async () => {
      mockOrderRepository.find.mockResolvedValue([]);

      const result = await service.getUserOrders('user-1');

      expect(result).toEqual([]);
    });
  });

  describe('updateOrderStatus', () => {
    it('should update order status', async () => {
      const dto = {
        orderId: 'order-1',
        status: OrderStatus.SHIPPED,
      };

      mockQueryRunner.manager.findOne.mockResolvedValue(mockOrder as any);
      mockQueryRunner.manager.save.mockResolvedValue({
        ...mockOrder,
        status: OrderStatus.SHIPPED,
      } as any);
      mockIdempotencyService.markCompleted.mockResolvedValue(undefined);

      const result = await service.updateOrderStatus(dto, 'idempotency-key');

      expect(mockQueryRunner.manager.save).toHaveBeenCalled();
      expect(result.status).toBe(OrderStatus.SHIPPED);
    });

    it('should throw an error if order not found', async () => {
      const dto = {
        orderId: 'order-1',
        status: OrderStatus.SHIPPED,
      };

      mockQueryRunner.manager.findOne.mockResolvedValue(null);

      await expect(service.updateOrderStatus(dto, 'idempotency-key')).rejects.toThrow(RpcException);
    });
  });

  describe('cancelOrder', () => {
    it('should cancel an order', async () => {
      const dto = {
        orderId: 'order-1',
        userId: 'user-1',
      };

      const pendingOrder = {
        ...mockOrder,
        status: OrderStatus.PENDING,
      };

      mockQueryRunner.manager.findOne.mockResolvedValue(pendingOrder as any);
      mockQueryRunner.manager.save.mockResolvedValue({
        ...pendingOrder,
        status: OrderStatus.CANCELLED,
      } as any);
      mockIdempotencyService.markCompleted.mockResolvedValue(undefined);

      const result = await service.cancelOrder('user-1', dto, 'idempotency-key');

      expect(mockQueryRunner.manager.save).toHaveBeenCalled();
      expect(result.status).toBe(OrderStatus.CANCELLED);
    });

    it('should throw an error if order not found', async () => {
      const dto = {
        orderId: 'order-1',
        userId: 'user-1',
      };

      mockQueryRunner.manager.findOne.mockResolvedValue(null);
      mockOrderRepository.findOne.mockResolvedValue(null);

      await expect(service.cancelOrder('user-1', dto, 'idempotency-key')).rejects.toThrow(
        RpcException,
      );
    });

    it('should throw an error if user does not own the order', async () => {
      const dto = {
        orderId: 'order-1',
        userId: 'user-2',
      };

      mockQueryRunner.manager.findOne.mockResolvedValue(mockOrder as any);

      await expect(service.cancelOrder('user-2', dto, 'idempotency-key')).rejects.toThrow(
        RpcException,
      );
    });
  });
});
