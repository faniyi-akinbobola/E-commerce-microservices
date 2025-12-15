import { InjectRedis } from '@nestjs-modules/ioredis/dist/redis.decorators';
import { Inject, Injectable } from '@nestjs/common';
import { IdempotencyService } from '@apps/common';

@Injectable()
export class CartService {

  constructor(
    @Inject('REDIS_CLIENT') private readonly redis,
    private readonly idempotencyService: IdempotencyService,
  ) {}

    private getCartKey(userId: string) {
    return `cart:${userId}`;
  }

  async updateCartItem(userId: string, productId: string, quantity: number, idempotencyKey: string) {
    // Step 1: Check idempotency
    const idempotencyCheck = await this.idempotencyService.checkIdempotency(
      idempotencyKey,
      'cart-service',
      'update_cart_item',
      { userId, productId, quantity }
    );

    if (idempotencyCheck.exists && idempotencyCheck.status === 'completed') {
      return idempotencyCheck.data;
    }

    if (idempotencyCheck.exists && idempotencyCheck.status === 'pending') {
      await new Promise(resolve => setTimeout(resolve, 100));
      const recheckResult = await this.idempotencyService.checkIdempotency(
        idempotencyKey,
        'cart-service',
        'update_cart_item',
        { userId, productId, quantity }
      );
      if (recheckResult.exists && recheckResult.status === 'completed') {
        return recheckResult.data;
      }
    }

    try {
      // Step 2: Execute business logic
      const key = this.getCartKey(userId);

      // Get the existing cart (or initialize empty)
      const cartRaw = await this.redis.get(key);
      const cart = cartRaw ? JSON.parse(cartRaw) : { items: [] };

      // Find existing item
      const itemIndex = cart.items.findIndex(item => item.productId === productId);

      // If quantity is 0 → remove item
      if (quantity === 0) {
        if (itemIndex !== -1) {
          cart.items.splice(itemIndex, 1);
        }

        await this.redis.set(key, JSON.stringify(cart));
        
        // Mark as completed
        await this.idempotencyService.markCompleted(
          idempotencyKey,
          'cart-service',
          'update_cart_item',
          { userId, productId, quantity },
          cart,
          200
        );
        
        return cart;
      }

      // If item exists → update quantity
      if (itemIndex !== -1) {
        cart.items[itemIndex].quantity = quantity;
      } else {
        // Add new item
        cart.items.push({ productId, quantity });
      }

      // Save updated cart
      await this.redis.set(key, JSON.stringify(cart));

      // Step 3: Mark as completed
      await this.idempotencyService.markCompleted(
        idempotencyKey,
        'cart-service',
        'update_cart_item',
        { userId, productId, quantity },
        cart,
        200
      );

      return cart;
    } catch (error) {
      await this.idempotencyService.markFailed(
        idempotencyKey,
        'cart-service',
        'update_cart_item',
        error.message
      );
      throw error;
    }
  }

  async clearCart(userId: string, idempotencyKey: string) {
    // Step 1: Check idempotency
    const idempotencyCheck = await this.idempotencyService.checkIdempotency(
      idempotencyKey,
      'cart-service',
      'clear_cart',
      { userId }
    );

    if (idempotencyCheck.exists && idempotencyCheck.status === 'completed') {
      return idempotencyCheck.data;
    }

    if (idempotencyCheck.exists && idempotencyCheck.status === 'pending') {
      await new Promise(resolve => setTimeout(resolve, 100));
      const recheckResult = await this.idempotencyService.checkIdempotency(
        idempotencyKey,
        'cart-service',
        'clear_cart',
        { userId }
      );
      if (recheckResult.exists && recheckResult.status === 'completed') {
        return recheckResult.data;
      }
    }

    try {
      // Step 2: Execute business logic
      await this.redis.del(this.getCartKey(userId));
      const result = { message: 'Cart cleared' };

      // Step 3: Mark as completed
      await this.idempotencyService.markCompleted(
        idempotencyKey,
        'cart-service',
        'clear_cart',
        { userId },
        result,
        200
      );

      return result;
    } catch (error) {
      await this.idempotencyService.markFailed(
        idempotencyKey,
        'cart-service',
        'clear_cart',
        error.message
      );
      throw error;
    }
  }

  async removeFromCart(userId: string, productId: string, idempotencyKey: string) {
    // Step 1: Check idempotency
    const idempotencyCheck = await this.idempotencyService.checkIdempotency(
      idempotencyKey,
      'cart-service',
      'remove_from_cart',
      { userId, productId }
    );

    if (idempotencyCheck.exists && idempotencyCheck.status === 'completed') {
      return idempotencyCheck.data;
    }

    if (idempotencyCheck.exists && idempotencyCheck.status === 'pending') {
      await new Promise(resolve => setTimeout(resolve, 100));
      const recheckResult = await this.idempotencyService.checkIdempotency(
        idempotencyKey,
        'cart-service',
        'remove_from_cart',
        { userId, productId }
      );
      if (recheckResult.exists && recheckResult.status === 'completed') {
        return recheckResult.data;
      }
    }

    try {
      // Step 2: Execute business logic
      const cart = await this.getCart(userId);

      cart.items = cart.items.filter(i => i.productId !== productId);

      await this.redis.set(this.getCartKey(userId), JSON.stringify(cart));

      // Step 3: Mark as completed
      await this.idempotencyService.markCompleted(
        idempotencyKey,
        'cart-service',
        'remove_from_cart',
        { userId, productId },
        cart,
        200
      );

      return cart;
    } catch (error) {
      await this.idempotencyService.markFailed(
        idempotencyKey,
        'cart-service',
        'remove_from_cart',
        error.message
      );
      throw error;
    }
  }

  async getCart(userId: string) {
    const data = await this.redis.get(this.getCartKey(userId));
    return data ? JSON.parse(data) : { items: [] };
  }

  async addToCart(userId: string, productId: string, quantity: number, idempotencyKey: string) {
    // Step 1: Check if this request has already been processed
    const idempotencyCheck = await this.idempotencyService.checkIdempotency(
      idempotencyKey,
      'cart-service',
      'add_to_cart',
      { userId, productId, quantity }
    );

    // If request already completed, return cached response
    if (idempotencyCheck.exists && idempotencyCheck.status === 'completed') {
      return idempotencyCheck.data;
    }

    // If request is still pending (rare race condition), wait and retry
    if (idempotencyCheck.exists && idempotencyCheck.status === 'pending') {
      // Wait a bit and check again
      await new Promise(resolve => setTimeout(resolve, 100));
      const recheckResult = await this.idempotencyService.checkIdempotency(
        idempotencyKey,
        'cart-service',
        'add_to_cart',
        { userId, productId, quantity }
      );
      if (recheckResult.exists && recheckResult.status === 'completed') {
        return recheckResult.data;
      }
    }

    try {
      // Step 2: Process the request (add item to cart)
      const cart = await this.getCart(userId);

      const existing = cart.items.find(item => item.productId === productId);

      if (existing) {
        existing.quantity += quantity;
      } else {
        cart.items.push({ productId, quantity });
      }

      await this.redis.set(
        this.getCartKey(userId),
        JSON.stringify(cart),
        'EX', 60 * 60 * 24 // cart expires in 24 hours
      );

      // Step 3: Mark operation as completed
      await this.idempotencyService.markCompleted(
        idempotencyKey,
        'cart-service',
        'add_to_cart',
        { userId, productId, quantity },
        cart,
        200
      );

      return cart;
    } catch (error) {
      // Mark operation as failed
      await this.idempotencyService.markFailed(
        idempotencyKey,
        'cart-service',
        'add_to_cart',
        error.message
      );
      throw error;
    }
  }
}