import { Controller, Get } from '@nestjs/common';
import { CartService } from './cart.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import * as crypto from 'crypto';

@Controller()
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @MessagePattern({ cmd: 'add_to_cart' })
  addToCart(
    @Payload()
    data: {
      userId: string;
      productId: string;
      quantity: number;
      idempotencyKey?: string;
    },
  ) {
    // Auto-hashing: If no idempotencyKey provided, generate one from the payload
    const idempotencyKey =
      data.idempotencyKey ||
      this.generateIdempotencyKey(
        { userId: data.userId, productId: data.productId, quantity: data.quantity },
        'add',
      );

    return this.cartService.addToCart(data.userId, data.productId, data.quantity, idempotencyKey);
  }

  /**
   * Auto-hashing: Generate idempotency key from request payload
   * This ensures identical requests (same user, product, quantity) are treated as duplicates
   */
  private generateIdempotencyKey(data: any, operation: string): string {
    // Create SHA-256 hash of the payload with operation name
    const hash = crypto
      .createHash('sha256')
      .update(JSON.stringify({ ...data, operation }))
      .digest('hex');

    return `auto-cart-${operation}-${hash}`;
  }

  @MessagePattern({ cmd: 'get_cart' })
  getCart(@Payload() data: { userId: string }) {
    // Read-only operation, no idempotency needed
    return this.cartService.getCart(data.userId);
  }

  @MessagePattern({ cmd: 'remove_from_cart' })
  removeFromCart(@Payload() data: { userId: string; productId: string }) {
    // Delete operations are naturally idempotent - no caching needed
    return this.cartService.removeFromCart(data.userId, data.productId, '');
  }

  @MessagePattern({ cmd: 'clear_cart' })
  clearCart(@Payload() data: { userId: string }) {
    // Delete operations are naturally idempotent - no caching needed
    return this.cartService.clearCart(data.userId, '');
  }

  @MessagePattern({ cmd: 'update_cart_item' })
  updateCartItem(
    @Payload()
    data: {
      userId: string;
      productId: string;
      quantity: number;
      idempotencyKey?: string;
    },
  ) {
    const idempotencyKey =
      data.idempotencyKey ||
      this.generateIdempotencyKey(
        { userId: data.userId, productId: data.productId, quantity: data.quantity },
        'update',
      );
    return this.cartService.updateCartItem(
      data.userId,
      data.productId,
      data.quantity,
      idempotencyKey,
    );
  }
}
