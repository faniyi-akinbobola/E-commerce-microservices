import { Controller, Post, Get, Patch, Body, Param, Inject, UseGuards, Req, OnModuleInit, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreateOrderDto, UpdateOrderStatusDto, CancelOrderDto, AddPaymentRecordDto, CircuitBreakerService } from '@apps/common';
import { lastValueFrom, timeout } from 'rxjs';
import { JwtBlacklistGuard } from '../guards/jwt-blacklist.guard';

@Controller('orders')
@UseGuards(JwtBlacklistGuard)
export class OrderController implements OnModuleInit {
  private readonly logger = new Logger(OrderController.name);

  // Circuit breakers for different order operations
  private createOrderCircuit;
  private getUserOrdersCircuit;
  private getAllOrdersCircuit;
  private getOrderByIdCircuit;
  private cancelOrderCircuit;
  private updateOrderStatusCircuit;
  private addPaymentRecordCircuit;

  constructor(
    @Inject('ORDER_SERVICE') private readonly orderClient: ClientProxy,
    private readonly circuitBreakerService: CircuitBreakerService,
  ) {}

  async onModuleInit() {
    this.initializeCircuitBreakers();
  }

  private initializeCircuitBreakers() {
    // Create order circuit breaker
    this.createOrderCircuit = this.circuitBreakerService.createCircuitBreaker(
      async (data: any) => {
        return await lastValueFrom(
          this.orderClient.send({ cmd: 'create_order' }, data).pipe(timeout(10000))
        );
      },
      {
        timeout: 10000,
        errorThresholdPercentage: 50,
        resetTimeout: 30000,
        name: 'order_create',
      }
    );

    this.createOrderCircuit.fallback(() => {
      throw new Error('Order creation service is temporarily unavailable. Please try again later.');
    });

    // Get user orders circuit breaker
    this.getUserOrdersCircuit = this.circuitBreakerService.createCircuitBreaker(
      async (userId: string) => {
        return await lastValueFrom(
          this.orderClient.send({ cmd: 'get_user_orders' }, userId).pipe(timeout(5000))
        );
      },
      {
        timeout: 5000,
        errorThresholdPercentage: 50,
        resetTimeout: 30000,
        name: 'order_get_user_orders',
      }
    );

    this.getUserOrdersCircuit.fallback(() => {
      throw new Error('Order retrieval service is temporarily unavailable. Please try again later.');
    });

    // Get all orders circuit breaker
    this.getAllOrdersCircuit = this.circuitBreakerService.createCircuitBreaker(
      async () => {
        return await lastValueFrom(
          this.orderClient.send({ cmd: 'get_all_orders' }, {}).pipe(timeout(5000))
        );
      },
      {
        timeout: 5000,
        errorThresholdPercentage: 50,
        resetTimeout: 30000,
        name: 'order_get_all_orders',
      }
    );

    this.getAllOrdersCircuit.fallback(() => {
      throw new Error('Order retrieval service is temporarily unavailable. Please try again later.');
    });

    // Get order by ID circuit breaker
    this.getOrderByIdCircuit = this.circuitBreakerService.createCircuitBreaker(
      async (id: string) => {
        return await lastValueFrom(
          this.orderClient.send({ cmd: 'get_order_by_id' }, id).pipe(timeout(5000))
        );
      },
      {
        timeout: 5000,
        errorThresholdPercentage: 50,
        resetTimeout: 30000,
        name: 'order_get_by_id',
      }
    );

    this.getOrderByIdCircuit.fallback(() => {
      throw new Error('Order retrieval service is temporarily unavailable. Please try again later.');
    });

    // Cancel order circuit breaker
    this.cancelOrderCircuit = this.circuitBreakerService.createCircuitBreaker(
      async (data: any) => {
        return await lastValueFrom(
          this.orderClient.send({ cmd: 'cancel_order' }, data).pipe(timeout(5000))
        );
      },
      {
        timeout: 5000,
        errorThresholdPercentage: 50,
        resetTimeout: 30000,
        name: 'order_cancel',
      }
    );

    this.cancelOrderCircuit.fallback(() => {
      throw new Error('Order cancellation service is temporarily unavailable. Please try again later.');
    });

    // Update order status circuit breaker
    this.updateOrderStatusCircuit = this.circuitBreakerService.createCircuitBreaker(
      async (data: any) => {
        return await lastValueFrom(
          this.orderClient.send({ cmd: 'update_order_status' }, data).pipe(timeout(5000))
        );
      },
      {
        timeout: 5000,
        errorThresholdPercentage: 50,
        resetTimeout: 30000,
        name: 'order_update_status',
      }
    );

    this.updateOrderStatusCircuit.fallback(() => {
      throw new Error('Order status update service is temporarily unavailable. Please try again later.');
    });

    // Add payment record circuit breaker
    this.addPaymentRecordCircuit = this.circuitBreakerService.createCircuitBreaker(
      async (data: any) => {
        return await lastValueFrom(
          this.orderClient.send({ cmd: 'add_payment_record' }, data).pipe(timeout(10000))
        );
      },
      {
        timeout: 10000,
        errorThresholdPercentage: 50,
        resetTimeout: 30000,
        name: 'order_add_payment',
      }
    );

    this.addPaymentRecordCircuit.fallback(() => {
      throw new Error('Payment record service is temporarily unavailable. Please try again later.');
    });

    this.logger.log('All order circuit breakers initialized');
  }

  @Post()
  async createOrder(@Req() req, @Body() createOrderDto: CreateOrderDto) {
    try {
      const userId = req.user.userId;
      return await this.createOrderCircuit.fire({ userId, dto: createOrderDto });
    } catch (error) {
      this.logger.error(`Create order failed: ${error.message}`);
      throw error;
    }
  }

  @Get()
  async getUserOrders(@Req() req) {
    try {
      const userId = req.user.userId;
      return await this.getUserOrdersCircuit.fire(userId);
    } catch (error) {
      this.logger.error(`Get user orders failed: ${error.message}`);
      throw error;
    }
  }

  @Get('all')
  async getAllOrders() {
    try {
      return await this.getAllOrdersCircuit.fire();
    } catch (error) {
      this.logger.error(`Get all orders failed: ${error.message}`);
      throw error;
    }
  }

  @Get(':id')
  async getOrderById(@Param('id') id: string) {
    try {
      return await this.getOrderByIdCircuit.fire(id);
    } catch (error) {
      this.logger.error(`Get order by ID failed: ${error.message}`);
      throw error;
    }
  }

  @Patch(':id/cancel')
  async cancelOrder(@Req() req, @Param('id') orderId: string) {
    try {
      const userId = req.user.userId;
      return await this.cancelOrderCircuit.fire({ userId, dto: { orderId, userId } });
    } catch (error) {
      this.logger.error(`Cancel order failed: ${error.message}`);
      throw error;
    }
  }

  @Patch(':id/status')
  async updateOrderStatus(@Param('id') orderId: string, @Body() updateDto: { status: string }) {
    try {
      return await this.updateOrderStatusCircuit.fire({ orderId, status: updateDto.status });
    } catch (error) {
      this.logger.error(`Update order status failed: ${error.message}`);
      throw error;
    }
  }

  @Post(':id/payment')
  async addPaymentRecord(@Param('id') orderId: string, @Body() paymentDto: AddPaymentRecordDto) {
    try {
      return await this.addPaymentRecordCircuit.fire({ ...paymentDto, orderId });
    } catch (error) {
      this.logger.error(`Add payment record failed: ${error.message}`);
      throw error;
    }
  }
}

