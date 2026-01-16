import {
  Controller,
  Inject,
  Post,
  Get,
  Delete,
  Patch,
  Param,
  Body,
  UseGuards,
  Req,
  OnModuleInit,
  Logger,
  ServiceUnavailableException,
  UseInterceptors,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { AddToCartDto, UpdateCartQuantityDto, RemoveCartItemDto } from '@apps/common';
import { JwtBlacklistGuard } from '../guards/jwt-blacklist.guard';
import { lastValueFrom, timeout } from 'rxjs';
import { CircuitBreakerService } from '@apps/common';
import { IdempotencyInterceptor } from '../interceptors/idempotency.interceptor';

@UseInterceptors(IdempotencyInterceptor)
@UseGuards(JwtBlacklistGuard)
@Controller({ path: 'cart', version: '1' })
export class CartController implements OnModuleInit {
  private readonly logger = new Logger(CartController.name);

  private addToCartCircuit;
  private getCartCircuit;
  private updateCartItemCircuit;
  private removeCartItemCircuit;
  private clearCartCircuit;

  constructor(
    @Inject('CART_SERVICE') private readonly cartService: ClientProxy,
    private readonly circuitBreakerService: CircuitBreakerService,
  ) {}

  async onModuleInit() {
    this.initializeCircuitBreakers();
  }

  private initializeCircuitBreakers() {
    this.addToCartCircuit = this.circuitBreakerService.createCircuitBreaker(
      async (data: AddToCartDto) => {
        return await lastValueFrom(
          this.cartService.send({ cmd: 'add_to_cart' }, data).pipe(timeout(10000)),
        );
      },
      {
        timeout: 10000,
        errorThresholdPercentage: 50,
        resetTimeout: 30000,
        name: 'cart_add_to_cart',
      },
    );

    this.addToCartCircuit.fallback(() => {
      throw new ServiceUnavailableException(
        'Add to cart service is temporarily unavailable. Please try again later.',
      );
    });

    this.getCartCircuit = this.circuitBreakerService.createCircuitBreaker(
      async (data: any) => {
        return await lastValueFrom(
          this.cartService.send({ cmd: 'get_cart' }, data).pipe(timeout(5000)),
        );
      },
      {
        timeout: 5000,
        errorThresholdPercentage: 50,
        resetTimeout: 30000,
        name: 'cart_get_cart',
      },
    );

    this.getCartCircuit.fallback(() => {
      throw new ServiceUnavailableException(
        'Get cart service is temporarily unavailable. Please try again later.',
      );
    });

    this.updateCartItemCircuit = this.circuitBreakerService.createCircuitBreaker(
      async (data: { productId: string } & UpdateCartQuantityDto) => {
        return await lastValueFrom(
          this.cartService.send({ cmd: 'update_cart_item' }, data).pipe(timeout(5000)),
        );
      },
      {
        timeout: 5000,
        errorThresholdPercentage: 50,
        resetTimeout: 30000,
        name: 'cart_update_cart_item',
      },
    );

    this.updateCartItemCircuit.fallback(() => {
      throw new ServiceUnavailableException(
        'Update cart item service is temporarily unavailable. Please try again later.',
      );
    });

    this.removeCartItemCircuit = this.circuitBreakerService.createCircuitBreaker(
      async (data: { productId: string; userId: string }) => {
        return await lastValueFrom(
          this.cartService.send({ cmd: 'remove_from_cart' }, data).pipe(timeout(5000)),
        );
      },
      {
        timeout: 5000,
        errorThresholdPercentage: 50,
        resetTimeout: 30000,
        name: 'cart_remove_from_cart',
      },
    );

    this.removeCartItemCircuit.fallback(() => {
      throw new ServiceUnavailableException(
        'Remove cart item service is temporarily unavailable. Please try again later.',
      );
    });

    this.clearCartCircuit = this.circuitBreakerService.createCircuitBreaker(
      async (data: { userId: string }) => {
        return await lastValueFrom(
          this.cartService.send({ cmd: 'clear_cart' }, data).pipe(timeout(5000)),
        );
      },
      {
        timeout: 5000,
        errorThresholdPercentage: 50,
        resetTimeout: 30000,
        name: 'cart_clear_cart',
      },
    );

    this.clearCartCircuit.fallback(() => {
      throw new ServiceUnavailableException(
        'Clear cart service is temporarily unavailable. Please try again later.',
      );
    });
  }

  @Post('addtocart')
  async addToCart(@Body() body: AddToCartDto, @Req() req) {
    // return this.cartService.send({ cmd: 'add_to_cart' }, { ...body, userId: req.user.id });
    try {
      return await this.addToCartCircuit.fire({ ...body, userId: req.user.id });
    } catch (error) {
      this.logger.error(`add to cart failed: ${error}`);
      throw error;
    }
  }

  @Get('getcart')
  async getCart(@Req() req) {
    // return this.cartService.send({ cmd: 'get_cart' }, { userId: req.user.id });
    try {
      return await this.getCartCircuit.fire({ userId: req.user.id });
    } catch (error) {
      this.logger.error(`get cart failed: ${error}`);
      throw error;
    }
  }

  @Patch('/updatecartitem/:productId')
  async updateCartItem(
    @Param('productId') productId: string,
    @Body() body: UpdateCartQuantityDto,
    @Req() req,
  ) {
    // return this.cartService.send({ cmd: 'update_cart_item' }, { productId, ...body, userId: req.user.id });
    try {
      return await this.updateCartItemCircuit.fire({ productId, ...body, userId: req.user.id });
    } catch (error) {
      this.logger.error(`update cart item failed: ${error}`);
      throw error;
    }
  }

  @Delete('/removecartitem/:productId')
  async removeCartItem(@Param('productId') productId: string, @Req() req) {
    try {
      this.logger.log(
        `[DEBUG] removeCartItem called - productId: ${productId}, userId: ${req.user?.id}, full user: ${JSON.stringify(req.user)}`,
      );
      const result = await this.removeCartItemCircuit.fire({ productId, userId: req.user.id });
      this.logger.log(`[DEBUG] removeCartItem result: ${JSON.stringify(result)}`);
      return result;
    } catch (error) {
      this.logger.error(`remove cart item failed: ${error}`);
      throw error;
    }
  }

  @Delete('clearcart')
  async clearCart(@Req() req) {
    try {
      return await this.clearCartCircuit.fire({ userId: req.user.id });
    } catch (error) {
      this.logger.error(`clear cart failed: ${error}`);
      throw error;
    }
  }
}
