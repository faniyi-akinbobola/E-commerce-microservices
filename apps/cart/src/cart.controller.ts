import { Controller, Get } from '@nestjs/common';
import { CartService } from './cart.service';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @MessagePattern({ cmd: 'add_to_cart' })
  addToCart(@Payload() data: { userId: string, productId: string,  quantity: number }){
    return this.cartService.addToCart(data.userId, data.productId, data.quantity);
  }

  @MessagePattern({ cmd: 'get_cart' })
  getCart(@Payload() data: { userId: string }){
    return this.cartService.getCart(data.userId);
  }

  @MessagePattern({ cmd: 'remove_from_cart' })
  removeFromCart(@Payload() data: { userId: string, productId: string }){
    return this.cartService.removeFromCart(data.userId, data.productId);
  }

  @MessagePattern({ cmd: 'clear_cart' })
  clearCart(@Payload() data: { userId: string }){
    return this.cartService.clearCart(data.userId);
  }

  @MessagePattern({ cmd: 'update_cart_item' })
  updateCartItem(@Payload() data: { userId: string, productId: string, quantity: number }){
    return this.cartService.updateCartItem(data.userId, data.productId, data.quantity);
  }


}
