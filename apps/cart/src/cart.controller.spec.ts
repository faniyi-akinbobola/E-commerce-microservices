import { Test, TestingModule } from '@nestjs/testing';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';

describe('CartController', () => {
  let cartController: CartController;

  const cartServiceMock = {
    addToCart: jest.fn().mockImplementation((userId, productId, quantity, idempotencyKey) => {
      return { userId, productId, quantity, idempotencyKey };
    }),
    getCart: jest.fn().mockImplementation((userId) => {
      return { userId, items: [] };
    }),
    removeFromCart: jest.fn().mockImplementation((userId, productId, idempotencyKey) => {
      return { userId, productId, idempotencyKey };
    }),
    clearCart: jest.fn().mockImplementation((userId) => {
      return { userId };
    }),
    updateCartItem: jest.fn().mockImplementation((userId, productId, quantity, idempotencyKey) => {
      return { userId, productId, quantity, idempotencyKey };
    }),
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [CartController],
      providers: [CartService],
    })
      .overrideProvider(CartService)
      .useValue(cartServiceMock)
      .compile();

    cartController = app.get<CartController>(CartController);
  });

  describe('root', () => {
    it('should be defined', () => {
      expect(cartController).toBeDefined();
    });
  });

  describe('addToCart', () => {
    it('should add item to cart with auto-generated idempotency key', () => {
      expect(
        cartController.addToCart({ userId: 'user1', productId: 'prod1', quantity: 2 }),
      ).toEqual({
        userId: 'user1',
        productId: 'prod1',
        quantity: 2,
        idempotencyKey: expect.stringMatching(/^auto-cart-add-[a-f0-9]{64}$/),
      });
      expect(cartServiceMock.addToCart).toHaveBeenCalledWith(
        'user1',
        'prod1',
        2,
        expect.stringMatching(/^auto-cart-add-[a-f0-9]{64}$/),
      );
    });

    it('should add item to cart with provided idempotency key', () => {
      expect(
        cartController.addToCart({
          userId: 'user1',
          productId: 'prod1',
          quantity: 2,
          idempotencyKey: 'custom-key-123',
        }),
      ).toEqual({
        userId: 'user1',
        productId: 'prod1',
        quantity: 2,
        idempotencyKey: 'custom-key-123',
      });
      expect(cartServiceMock.addToCart).toHaveBeenCalledWith('user1', 'prod1', 2, 'custom-key-123');
    });
  });

  describe('getCart', () => {
    it("should get user's cart", () => {
      expect(cartController.getCart({ userId: 'user1' })).toEqual({ userId: 'user1', items: [] });
      expect(cartServiceMock.getCart).toHaveBeenCalledWith('user1');
    });
  });

  describe('removeFromCart', () => {
    it('should remove item from cart with auto-generated idempotency key', () => {
      expect(cartController.removeFromCart({ userId: 'user1', productId: 'prod1' })).toEqual({
        userId: 'user1',
        productId: 'prod1',
        idempotencyKey: expect.stringMatching(/^auto-cart-remove-[a-f0-9]{64}$/),
      });
      expect(cartServiceMock.removeFromCart).toHaveBeenCalledWith(
        'user1',
        'prod1',
        expect.stringMatching(/^auto-cart-remove-[a-f0-9]{64}$/),
      );
    });

    it('should remove item from cart with provided idempotency key', () => {
      expect(
        cartController.removeFromCart({
          userId: 'user1',
          productId: 'prod1',
          idempotencyKey: 'custom-remove-key',
        }),
      ).toEqual({
        userId: 'user1',
        productId: 'prod1',
        idempotencyKey: 'custom-remove-key',
      });
      expect(cartServiceMock.removeFromCart).toHaveBeenCalledWith(
        'user1',
        'prod1',
        'custom-remove-key',
      );
    });
  });

  describe('clearCart', () => {
    it('should clear cart with auto-generated idempotency key', () => {
      cartController.clearCart({ userId: 'user1' });

      expect(cartServiceMock.clearCart).toHaveBeenCalledWith(
        'user1',
        expect.stringMatching(/^auto-cart-clear-[a-f0-9]{64}$/),
      );
    });

    it('should clear cart with provided idempotency key', () => {
      cartController.clearCart({ userId: 'user1', idempotencyKey: 'custom-clear-key' });

      expect(cartServiceMock.clearCart).toHaveBeenCalledWith('user1', 'custom-clear-key');
    });
  });

  describe('updateCartItem', () => {
    it('should update cart item with auto-generated idempotency key', () => {
      expect(
        cartController.updateCartItem({ userId: 'user1', productId: 'prod1', quantity: 5 }),
      ).toEqual({
        userId: 'user1',
        productId: 'prod1',
        quantity: 5,
        idempotencyKey: expect.stringMatching(/^auto-cart-update-[a-f0-9]{64}$/),
      });
      expect(cartServiceMock.updateCartItem).toHaveBeenCalledWith(
        'user1',
        'prod1',
        5,
        expect.stringMatching(/^auto-cart-update-[a-f0-9]{64}$/),
      );
    });

    it('should update cart item with provided idempotency key', () => {
      expect(
        cartController.updateCartItem({
          userId: 'user1',
          productId: 'prod1',
          quantity: 5,
          idempotencyKey: 'custom-update-key',
        }),
      ).toEqual({
        userId: 'user1',
        productId: 'prod1',
        quantity: 5,
        idempotencyKey: 'custom-update-key',
      });
      expect(cartServiceMock.updateCartItem).toHaveBeenCalledWith(
        'user1',
        'prod1',
        5,
        'custom-update-key',
      );
    });
  });
});
