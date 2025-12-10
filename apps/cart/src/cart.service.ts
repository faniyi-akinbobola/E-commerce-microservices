import { InjectRedis } from '@nestjs-modules/ioredis/dist/redis.decorators';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class CartService {

  constructor(@Inject('REDIS_CLIENT') private readonly redis) {}

    private getCartKey(userId: string) {
    return `cart:${userId}`;
  }

  async updateCartItem(userId: string, productId: string, quantity: number) {
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

    return cart;
  
  }

  async clearCart(userId: string) {
    await this.redis.del(this.getCartKey(userId));
    return { message: 'Cart cleared' };
  }

  async removeFromCart(userId: string, productId: string) {
    const cart = await this.getCart(userId);

    cart.items = cart.items.filter(i => i.productId !== productId);

    await this.redis.set(this.getCartKey(userId), JSON.stringify(cart));

    return cart;
  }

  async getCart(userId: string) {
    const data = await this.redis.get(this.getCartKey(userId));
    return data ? JSON.parse(data) : { items: [] };
  }

  async addToCart(userId: string, productId: string, quantity: number) {
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
      { EX: 60 * 60 * 24 } // cart expires in 24 hours
    );

    return cart;
  
  }
}