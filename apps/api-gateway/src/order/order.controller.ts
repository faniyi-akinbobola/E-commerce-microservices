import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Inject,
  UseGuards,
  Req,
  OnModuleInit,
  Logger,
  UseInterceptors,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  CreateOrderDto,
  UpdateOrderStatusDto,
  CancelOrderDto,
  CircuitBreakerService,
} from '@apps/common';
import { lastValueFrom, timeout } from 'rxjs';
import { JwtBlacklistGuard } from '../guards/jwt-blacklist.guard';
import { IdempotencyInterceptor } from '../interceptors/idempotency.interceptor';
import { randomUUID } from 'crypto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Orders')
@ApiBearerAuth('JWT-auth')
@UseInterceptors(IdempotencyInterceptor)
@UseGuards(JwtBlacklistGuard)
@Controller({ path: 'orders', version: '1' })
export class OrderController implements OnModuleInit {
  private readonly logger = new Logger(OrderController.name);

  // Circuit breakers for different order operations
  private createOrderCircuit;
  private getUserOrdersCircuit;
  private getAllOrdersCircuit;
  private getOrderByIdCircuit;
  private cancelOrderCircuit;
  private updateOrderStatusCircuit;

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
          this.orderClient.send({ cmd: 'create_order' }, data).pipe(timeout(10000)),
        );
      },
      {
        timeout: 10000,
        errorThresholdPercentage: 50,
        resetTimeout: 30000,
        name: 'order_create',
      },
    );

    this.createOrderCircuit.fallback(() => {
      throw new Error('Order creation service is temporarily unavailable. Please try again later.');
    });

    // Get user orders circuit breaker
    this.getUserOrdersCircuit = this.circuitBreakerService.createCircuitBreaker(
      async (userId: string) => {
        return await lastValueFrom(
          this.orderClient.send({ cmd: 'get_user_orders' }, userId).pipe(timeout(5000)),
        );
      },
      {
        timeout: 5000,
        errorThresholdPercentage: 50,
        resetTimeout: 30000,
        name: 'order_get_user_orders',
      },
    );

    this.getUserOrdersCircuit.fallback(() => {
      throw new Error(
        'Order retrieval service is temporarily unavailable. Please try again later.',
      );
    });

    // Get all orders circuit breaker
    this.getAllOrdersCircuit = this.circuitBreakerService.createCircuitBreaker(
      async () => {
        return await lastValueFrom(
          this.orderClient.send({ cmd: 'get_all_orders' }, {}).pipe(timeout(5000)),
        );
      },
      {
        timeout: 5000,
        errorThresholdPercentage: 50,
        resetTimeout: 30000,
        name: 'order_get_all_orders',
      },
    );

    this.getAllOrdersCircuit.fallback(() => {
      throw new Error(
        'Order retrieval service is temporarily unavailable. Please try again later.',
      );
    });

    // Get order by ID circuit breaker
    this.getOrderByIdCircuit = this.circuitBreakerService.createCircuitBreaker(
      async (id: string) => {
        return await lastValueFrom(
          this.orderClient.send({ cmd: 'get_order_by_id' }, id).pipe(timeout(5000)),
        );
      },
      {
        timeout: 5000,
        errorThresholdPercentage: 50,
        resetTimeout: 30000,
        name: 'order_get_by_id',
      },
    );

    this.getOrderByIdCircuit.fallback(() => {
      throw new Error(
        'Order retrieval service is temporarily unavailable. Please try again later.',
      );
    });

    // Cancel order circuit breaker
    this.cancelOrderCircuit = this.circuitBreakerService.createCircuitBreaker(
      async (data: any) => {
        return await lastValueFrom(
          this.orderClient.send({ cmd: 'cancel_order' }, data).pipe(timeout(5000)),
        );
      },
      {
        timeout: 5000,
        errorThresholdPercentage: 50,
        resetTimeout: 30000,
        name: 'order_cancel',
      },
    );

    this.cancelOrderCircuit.fallback(() => {
      throw new Error(
        'Order cancellation service is temporarily unavailable. Please try again later.',
      );
    });

    // Update order status circuit breaker
    this.updateOrderStatusCircuit = this.circuitBreakerService.createCircuitBreaker(
      async (data: any) => {
        return await lastValueFrom(
          this.orderClient.send({ cmd: 'update_order_status' }, data).pipe(timeout(5000)),
        );
      },
      {
        timeout: 5000,
        errorThresholdPercentage: 50,
        resetTimeout: 30000,
        name: 'order_update_status',
      },
    );

    this.updateOrderStatusCircuit.fallback(() => {
      throw new Error(
        'Order status update service is temporarily unavailable. Please try again later.',
      );
    });

    this.logger.log('All order circuit breakers initialized');
  }

  @Post()
  @ApiOperation({
    summary: 'Create order',
    description:
      "Create a new order from the user's cart items. Automatically clears cart after successful payment. Supports Stripe payment integration.",
  })
  @ApiBody({ type: CreateOrderDto })
  @ApiResponse({
    status: 201,
    description: 'Order created successfully',
    schema: {
      example: {
        id: 'order_123',
        userId: '123',
        items: [
          {
            productId: 'prod_456',
            name: 'Laptop',
            price: 999.99,
            quantity: 2,
            subtotal: 1999.98,
          },
        ],
        total: 1999.98,
        status: 'pending',
        paymentIntent: 'pi_abc123',
        createdAt: '2026-01-16T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input - Empty cart or invalid address' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  @ApiResponse({ status: 503, description: 'Service temporarily unavailable' })
  async createOrder(@Req() req, @Body() createOrderDto: CreateOrderDto) {
    try {
      const userId = req.user.userId;
      const idempotencyKey =
        req.headers['idempotency-key'] || req.headers['x-idempotency-key'] || randomUUID();
      return await this.createOrderCircuit.fire({
        userId,
        dto: createOrderDto,
        idempotencyKey,
      });
    } catch (error) {
      this.logger.error(`Create order failed: ${error.message}`);
      throw error;
    }
  }

  @Get()
  @ApiOperation({
    summary: 'Get user orders',
    description:
      'Retrieve all orders for the authenticated user with order details, status, and payment information.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of user orders',
    schema: {
      example: [
        {
          id: 'order_123',
          userId: '123',
          items: [{ productId: 'prod_456', quantity: 2, price: 999.99 }],
          total: 1999.98,
          status: 'paid',
          createdAt: '2026-01-16T10:00:00.000Z',
        },
      ],
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  @ApiResponse({ status: 503, description: 'Service temporarily unavailable' })
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
  @ApiOperation({
    summary: 'Get all orders (Admin)',
    description:
      'Retrieve all orders from all users. Admin endpoint for order management and monitoring.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of all orders',
    schema: {
      example: [
        {
          id: 'order_123',
          userId: '123',
          total: 1999.98,
          status: 'paid',
          createdAt: '2026-01-16T10:00:00.000Z',
        },
        {
          id: 'order_124',
          userId: '124',
          total: 499.99,
          status: 'pending',
          createdAt: '2026-01-16T11:00:00.000Z',
        },
      ],
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  @ApiResponse({ status: 503, description: 'Service temporarily unavailable' })
  async getAllOrders() {
    try {
      return await this.getAllOrdersCircuit.fire();
    } catch (error) {
      this.logger.error(`Get all orders failed: ${error.message}`);
      throw error;
    }
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get order by ID',
    description:
      'Retrieve detailed information about a specific order including items, payment status, and delivery details.',
  })
  @ApiParam({ name: 'id', description: 'Order ID', example: 'order_123' })
  @ApiResponse({
    status: 200,
    description: 'Order details',
    schema: {
      example: {
        id: 'order_123',
        userId: '123',
        items: [
          {
            productId: 'prod_456',
            name: 'Laptop',
            price: 999.99,
            quantity: 2,
            subtotal: 1999.98,
          },
        ],
        total: 1999.98,
        status: 'paid',
        paymentIntent: 'pi_abc123',
        address: {
          street: '123 Main St',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94102',
        },
        createdAt: '2026-01-16T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  @ApiResponse({ status: 503, description: 'Service temporarily unavailable' })
  async getOrderById(@Param('id') id: string) {
    try {
      return await this.getOrderByIdCircuit.fire(id);
    } catch (error) {
      this.logger.error(`Get order by ID failed: ${error.message}`);
      throw error;
    }
  }

  @Patch(':id/cancel')
  @ApiOperation({
    summary: 'Cancel order',
    description:
      'Cancel an existing order. Only orders with status "pending" or "processing" can be cancelled. Refunds are processed automatically.',
  })
  @ApiParam({ name: 'id', description: 'Order ID to cancel', example: 'order_123' })
  @ApiResponse({
    status: 200,
    description: 'Order cancelled successfully',
    schema: {
      example: {
        id: 'order_123',
        status: 'cancelled',
        message: 'Order cancelled successfully',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Order cannot be cancelled - Already shipped or delivered',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  @ApiResponse({ status: 503, description: 'Service temporarily unavailable' })
  async cancelOrder(@Req() req, @Param('id') orderId: string) {
    try {
      const userId = req.user.userId;
      const idempotencyKey = req.headers['idempotency-key'] || req.headers['x-idempotency-key'];
      return await this.cancelOrderCircuit.fire({
        userId,
        dto: { orderId, userId },
        idempotencyKey,
      });
    } catch (error) {
      this.logger.error(`Cancel order failed: ${error.message}`);
      throw error;
    }
  }

  @Patch(':id/status')
  @ApiOperation({
    summary: 'Update order status',
    description:
      'Update the status of an order. Available statuses: pending, processing, paid, shipped, delivered, cancelled. Admin/Staff endpoint.',
  })
  @ApiParam({ name: 'id', description: 'Order ID to update', example: 'order_123' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['pending', 'processing', 'paid', 'shipped', 'delivered', 'cancelled'],
          example: 'shipped',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Order status updated successfully',
    schema: {
      example: {
        id: 'order_123',
        status: 'shipped',
        updatedAt: '2026-01-16T12:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid status value' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  @ApiResponse({ status: 503, description: 'Service temporarily unavailable' })
  async updateOrderStatus(
    @Req() req,
    @Param('id') orderId: string,
    @Body() updateDto: { status: string },
  ) {
    try {
      const idempotencyKey = req.headers['idempotency-key'] || req.headers['x-idempotency-key'];
      return await this.updateOrderStatusCircuit.fire({
        dto: {
          orderId,
          status: updateDto.status,
        },
        idempotencyKey,
      });
    } catch (error) {
      this.logger.error(`Update order status failed: ${error.message}`);
      throw error;
    }
  }
}
