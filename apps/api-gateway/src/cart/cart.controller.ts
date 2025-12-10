import { Controller, Inject, Post, Get, Delete, Patch, Param, Body, UseGuards, Req } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { AddToCartDto, UpdateCartQuantityDto, RemoveCartItemDto } from '@apps/common';
import { JwtBlacklistGuard } from '../guards/jwt-blacklist.guard';


@UseGuards(JwtBlacklistGuard)
@Controller('cart')
export class CartController {
    constructor(@Inject('CART_SERVICE') private readonly cartService: ClientProxy) {}

    @Post('addtocart')
    addToCart(@Body() body: AddToCartDto, @Req() req) {
        return this.cartService.send({ cmd: 'add_to_cart' }, { ...body, userId: req.user.id });
    }

    @Get('getcart')
    getCart(@Req() req) {
        return this.cartService.send({ cmd: 'get_cart' }, { userId: req.user.id });
    }

    @Patch('/updatecartitem/:productId')
    updateCartItem(@Param('productId') productId: string, @Body() body: UpdateCartQuantityDto, @Req() req) {
        return this.cartService.send({ cmd: 'update_cart_item' }, { productId, ...body, userId: req.user.id });
    }

    @Delete('/removecartitem/:productId')
    removeCartItem(@Param('productId') productId: string, @Req() req) {
        return this.cartService.send({ cmd: 'remove_from_cart' }, { productId, userId: req.user.id });
    }

    @Delete('clearcart')
    clearCart(@Req() req) {
        return this.cartService.send({ cmd: 'clear_cart' }, { userId: req.user.id });
    }
}
