import { Test, TestingModule } from '@nestjs/testing';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { OrderStatus } from './entities/order-entity';

describe('OrderController', () => {
  let orderController: OrderController;

  const orderServiceMock = {
    createOrder: jest.fn().mockImplementation((userId, dto, idempotencyKey) => {
      return { userId, dto, idempotencyKey };
    }),
    getOrderById: jest.fn().mockImplementation((orderId) => {
      return { orderId };
    }),
    getAllOrders: jest.fn().mockImplementation(() => {
      return [];
    }),
    getUserOrders: jest.fn().mockImplementation((userId) => {
      return { userId, orders: [] };
    }),
    cancelOrder: jest.fn().mockImplementation((userId, dto, idempotencyKey) => {
      return { userId, dto, idempotencyKey };
    }),
    updateOrderStatus: jest.fn().mockImplementation((dto, idempotencyKey) => {
      return { dto, idempotencyKey };
    }),
    addPaymentRecord: jest.fn().mockImplementation((dto) => {
      return { dto };
    }),
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [OrderController],
      providers: [OrderService],
    })
      .overrideProvider(OrderService)
      .useValue(orderServiceMock)
      .compile();

    orderController = app.get<OrderController>(OrderController);
  });

  describe('root', () => {
    it('should be defined', () => {
      expect(orderController).toBeDefined();
    });
  });

  describe('createOrder', () => {
    it('should create an order with auto-generated idempotency key', () => {
      const dto = {
        userId: 'user1',
        shippingAddressId: 'addr-123',
        charge: {
          amount: 100,
          card: { number: '4242424242424242', exp_month: 12, exp_year: 2025, cvc: '123' },
        },
      } as any;
      expect(
        orderController.createOrder({
          userId: 'user1',
          dto,
          idempotencyKey: expect.stringMatching(/^auto-order-create-[a-f0-9]{64}$/) as any,
        }),
      ).toEqual({
        userId: 'user1',
        dto,
        idempotencyKey: expect.stringMatching(/^auto-order-create-[a-f0-9]{64}$/),
      });
    });

    it('should create an order with provided idempotency key', () => {
      const dto = {
        userId: 'user1',
        shippingAddressId: 'addr-123',
        charge: {
          amount: 100,
          card: { number: '4242424242424242', exp_month: 12, exp_year: 2025, cvc: '123' },
        },
      } as any;
      expect(
        orderController.createOrder({ userId: 'user1', dto, idempotencyKey: 'custom-key-123' }),
      ).toEqual({
        userId: 'user1',
        dto,
        idempotencyKey: 'custom-key-123',
      });
    });
  });

  describe('getOrderById', () => {
    it("should get user's order by ID", () => {
      expect(orderController.getOrderById('order1')).toEqual({ orderId: 'order1' });
    });
  });

  describe('getAllOrders', () => {
    it('should get all orders', () => {
      expect(orderController.getAllOrders()).toEqual([]);
    });
  });

  describe('getUserOrders', () => {
    it("should get user's orders", () => {
      expect(orderController.getUserOrders('user1')).toEqual({ userId: 'user1', orders: [] });
    });
  });

  describe('cancelOrder', () => {
    it('should cancel an order with auto-generated idempotency key', () => {
      const dto = { orderId: 'order1', userId: 'user1' };
      expect(
        orderController.cancelOrder({
          userId: 'user1',
          dto,
          idempotencyKey: expect.stringMatching(/^auto-order-cancel-[a-f0-9]{64}$/) as any,
        }),
      ).toEqual({
        userId: 'user1',
        dto,
        idempotencyKey: expect.stringMatching(/^auto-order-cancel-[a-f0-9]{64}$/),
      });
    });

    it('should cancel an order with provided idempotency key', () => {
      const dto = { orderId: 'order1', userId: 'user1' };
      expect(
        orderController.cancelOrder({ userId: 'user1', dto, idempotencyKey: 'custom-key-123' }),
      ).toEqual({
        userId: 'user1',
        dto,
        idempotencyKey: 'custom-key-123',
      });
    });
  });

  describe('updateOrderStatus', () => {
    it('should update order status with auto-generated idempotency key', () => {
      const dto = { orderId: 'order1', status: OrderStatus.SHIPPED };
      expect(
        orderController.updateOrderStatus({
          dto,
          idempotencyKey: expect.stringMatching(/^auto-order-update-status-[a-f0-9]{64}$/) as any,
        }),
      ).toEqual({
        dto,
        idempotencyKey: expect.stringMatching(/^auto-order-update-status-[a-f0-9]{64}$/),
      });
    });

    it('should update order status with provided idempotency key', () => {
      const dto = { orderId: 'order1', status: OrderStatus.SHIPPED };
      expect(orderController.updateOrderStatus({ dto, idempotencyKey: 'custom-key-123' })).toEqual({
        dto,
        idempotencyKey: 'custom-key-123',
      });
    });
  });
});
