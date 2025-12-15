import { Injectable, Inject, OnModuleInit, Logger, ServiceUnavailableException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderItem } from './entities/order-item.entity';
import { Order, OrderStatus } from './entities/order-entity';
import { Repository } from 'typeorm';
import { CreateOrderDto, UpdateOrderStatusDto, CancelOrderDto, AddPaymentRecordDto, CircuitBreakerService } from '@apps/common';
import { RpcException, ClientProxy } from '@nestjs/microservices';
import { lastValueFrom, timeout } from 'rxjs';
import { IdempotencyService } from '@apps/common';


@Injectable()
export class OrderService implements OnModuleInit {
  private readonly logger = new Logger(OrderService.name);

  // Circuit breakers for external service calls
  private getUserAddressCircuit;
  private getUserByIdCircuit;
  private getProductCircuit;
  private getCartCircuit;
  private getNotificationCircuit;
  private getPaymentCircuit;

  constructor(
    @InjectRepository(Order) private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem) private readonly orderItemRepository: Repository<OrderItem>,
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
    @Inject('CART_SERVICE') private readonly cartClient: ClientProxy,
    @Inject('PRODUCT_SERVICE') private readonly productClient: ClientProxy,
    @Inject('NOTIFICATION_SERVICE') private readonly notificationClient: ClientProxy,
    @Inject('PAYMENT_SERVICE') private readonly paymentClient: ClientProxy,
    private readonly circuitBreakerService: CircuitBreakerService,
    private readonly idempotencyService: IdempotencyService,
  ){}

  onModuleInit() {
    this.initializeCircuitBreakers();
  }

  private initializeCircuitBreakers() {
    // Circuit breaker for Auth Service - Get User Address
    this.getUserAddressCircuit = this.circuitBreakerService.createCircuitBreaker(
      async (data: any) => {
        return await lastValueFrom(
          this.authClient.send(
            { cmd: 'get_user_address_by_id' },
            data
          ).pipe(timeout(10000))
        );
      },
      {
        timeout: 10000,
        errorThresholdPercentage: 50,
        resetTimeout: 30000,
        name: 'order_get_user_address',
      }
    );

    this.getUserAddressCircuit.fallback(() => {
      throw new RpcException('Unable to retrieve shipping address. Auth service is temporarily unavailable.');
    });

    // Circuit breaker for Auth Service - Get User Details
    this.getUserByIdCircuit = this.circuitBreakerService.createCircuitBreaker(
      async (data: any) => {
        return await lastValueFrom(
          this.authClient.send({ cmd: 'get_user_by_id' }, data).pipe(timeout(5000))
        );
      },
      {
        timeout: 5000,
        errorThresholdPercentage: 50,
        resetTimeout: 30000,
        name: 'order_get_user_by_id',
      }
    );

    this.getUserByIdCircuit.fallback(() => {
      throw new RpcException('Unable to retrieve user details. Auth service is temporarily unavailable.');
    });

    // Circuit breaker for Product Service - Get Product Details
    this.getProductCircuit = this.circuitBreakerService.createCircuitBreaker(
      async (data: any) => {
        return await lastValueFrom(
          this.productClient.send({ cmd: 'get_product_by_id' }, data).pipe(timeout(5000))
        );
      },
      {
        timeout: 5000,
        errorThresholdPercentage: 50,
        resetTimeout: 30000,
        name: 'order_get_product',
      }
    );

    this.getProductCircuit.fallback(() => {
      throw new RpcException('Unable to retrieve product details. Product service is temporarily unavailable.');
    });

    this.getCartCircuit = this.circuitBreakerService.createCircuitBreaker(
      async (data: any) => {
        return await lastValueFrom(
          this.cartClient.send({ cmd: 'get_cart' }, data).pipe(timeout(10000))
        );
      },
      {
        timeout: 10000,
        errorThresholdPercentage: 50,
        resetTimeout: 30000,
        name: 'order_get_cart',
      }
    );
    
    this.getCartCircuit.fallback(() => {
      throw new RpcException('Unable to retrieve cart details. Cart service is temporarily unavailable.');
    });

    this.getNotificationCircuit = this.circuitBreakerService.createCircuitBreaker(
      async (data: any)=>{
        return await lastValueFrom(this.notificationClient.emit({cmd:"order_created"}, {data}))
      },
      {
        timeout: 10000,
        errorThresholdPercentage: 50,
        resetTimeout: 3000,
        name: "order_created"
      }
    );

    this.getNotificationCircuit.fallback(()=>{
      throw new ServiceUnavailableException(`Unable to send order notifications. Notifications service is temporarily unavailable.`)
    });

    this.getPaymentCircuit = this.circuitBreakerService.createCircuitBreaker(
      async (data: any) => {
        return await lastValueFrom(
          this.paymentClient.send({ cmd: 'create_charge' }, data).pipe(timeout(15000))
        );
      },
      {
        timeout: 15000,
        errorThresholdPercentage: 50,
        resetTimeout: 30000,
        name: 'order_create_payment',
      }
    );

    this.getPaymentCircuit.fallback(() => {
      throw new RpcException('Unable to process payment. Payment service is temporarily unavailable.');
    });



    this.logger.log('All order service circuit breakers initialized');
  }


  async updateOrderStatus(updateOrderStatusDto: UpdateOrderStatusDto) {
    const order = await this.orderRepository.findOne({
      where: { id: updateOrderStatusDto.orderId },
    });

    if (!order) {
      throw new RpcException('Order not found');
    }

    order.status = updateOrderStatusDto.status;
    order.updatedAt = new Date();

    return this.orderRepository.save(order);
  }

  async cancelOrder(userId: string, cancelOrderDto: CancelOrderDto) {
    const order = await this.orderRepository.findOne({
      where: { id: cancelOrderDto.orderId, userId },
      relations: ['items'],
    });

    if (!order) {
      throw new RpcException('Order not found or unauthorized');
    }

    if (order.status === OrderStatus.SHIPPED || order.status === OrderStatus.DELIVERED) {
      throw new RpcException('Cannot cancel order that has been shipped or delivered');
    }

    order.status = OrderStatus.CANCELLED;
    order.updatedAt = new Date();

    return this.orderRepository.save(order);
  }

  async getUserOrders(userId: string) {
    return this.orderRepository.find({
      where: { userId },
      relations: ['items'],
      order: { createdAt: 'DESC' },
    });
  }

  async getAllOrders() {
    return this.orderRepository.find({
      relations: ['items'],
      order: { createdAt: 'DESC' },
    });
  }

  async getOrderById(orderId: string) {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['items'],
    });

    if (!order) {
      throw new RpcException('Order not found');
    }

    return order;
  }

  async createOrder(userId: string, createOrderDto: CreateOrderDto, idempotencyKey: string) {
    try {

      
      console.log('[OrderService] Creating order for user:', userId, 'DTO:', createOrderDto);
      
      // 1. CHECK IDEMPOTENCY - Do this FIRST before any operations
      const idempotencyCheck = await this.idempotencyService.checkIdempotency(
        idempotencyKey,
        'order-service',
        '/order/create',
        createOrderDto,
      );

      // If request is already completed, return cached result
      if (idempotencyCheck.exists && idempotencyCheck.status === 'completed') {
        console.log('[OrderService] Returning cached order result for idempotency key:', idempotencyKey);
        return idempotencyCheck.data;
      }

      // If request is still pending (concurrent request), throw error
      if (idempotencyCheck.exists && idempotencyCheck.status === 'pending') {
        throw new RpcException('Request is already being processed. Please wait.');
      }
      
      // 2. Request the user's shipping address from Auth Service
      console.log('[OrderService] Calling auth service to get address with params:', { id: createOrderDto.shippingAddressId, userId });      let address;
      try {
        address = await this.getUserAddressCircuit.fire({ 
          id: createOrderDto.shippingAddressId, 
          userId 
        });
        
        console.log('[OrderService] Address retrieved:', JSON.stringify(address));

        if (!address) {
          throw new RpcException('Shipping address not found for user');
        }
        
        // If userId is undefined, use the user ID from the address
        if (!userId && address.user && address.user.id) {
          userId = address.user.id;
          console.log('[OrderService] Using userId from address:', userId);
        }
      } catch (err) {
        console.error('[OrderService] Auth service call error:', err.message, err.stack);
        throw new RpcException(`Failed to get address: ${err.message}`);
      }
      
      // 1. Get user details for email notification
      console.log('[OrderService] Fetching user data for notifications');
      const user = await this.getUserByIdCircuit.fire({ id: userId });
      
      if (!user) {
        throw new RpcException('User not found');
      }
      
      console.log('[OrderService] User retrieved:', user.email, user.username);

      // 2. Build shippingAddress snapshot
      const shippingAddressSnapshot = {
        fullName: address.fullName,
        streetAddress: address.street,
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        country: address.country,
        phoneNumber: address.phone,
      };

      // 3. Request cart items from Cart Service
      const cart = await this.getCartCircuit.fire({ userId });

      console.log('[OrderService] Cart retrieved:', JSON.stringify(cart));

      if (!cart || !cart.items || cart.items.length === 0) {
        throw new RpcException('Cart is empty');
      }

      const cartItems = cart.items;

      // 4. For each cart item, fetch product details and build order items
      const orderItems: OrderItem[] = [];
      let subtotal = 0;

      for (const item of cartItems) {
        console.log('[OrderService] Fetching product:', item.productId);
        
        const product = await this.getProductCircuit.fire({ id: item.productId });

        console.log('[OrderService] Product retrieved:', JSON.stringify(product));

        if (!product) {
          throw new RpcException(`Product ${item.productId} not found`);
        }

        const itemSubtotal = product.price * item.quantity;
        subtotal += itemSubtotal;

        const orderItem = this.orderItemRepository.create({
          productId: product._id || product.id,
          name: product.name,
          price: product.price,
          quantity: item.quantity,
        });

        orderItems.push(orderItem);
      }

      // 5. Calculate totals
      const tax = subtotal * 0.075;
      const shippingFee = 10; // Fixed for now
      const totalPrice = subtotal + tax + shippingFee;

      console.log('[OrderService] Totals - subtotal:', subtotal, 'tax:', tax, 'total:', totalPrice);

      // process payment 
      let paymentResult;

      try {
        const amountInCents = Math.round(totalPrice * 100);
        
        paymentResult = await this.getPaymentCircuit.fire({
          userId,
          amount: amountInCents,
          currency: 'usd',
          charge: createOrderDto.charge, // Card details from DTO
          description: `Order for user ${userId}`,
          metadata: {
            userId,
            itemCount: cartItems.length,
          }
        });
        
        console.log('[OrderService] Payment successful:', JSON.stringify(paymentResult));
        
      } catch (error) {
        this.logger.error(`Payment service failed: ${error.message}`);
        throw new RpcException({
          message: 'Payment processing failed',
          error: error.message,
        });
      }


      // try {
      //   // Convert amount to cents/kobo (smallest currency unit) as integer
      //   const amountInCents = Math.round(totalPrice * 100);
        
      //   paymentResult = await lastValueFrom(
      //     this.paymentClient.send(
      //       { cmd: 'create_charge' },
      //       {
      //         userId,
      //         amount: amountInCents,
      //         currency: 'usd',
      //         charge: createOrderDto.charge, // Card details from DTO
      //         description: `Order for user ${userId}`,
      //         metadata: {
      //           userId,
      //           itemCount: cartItems.length,
      //         }
      //       }
      //     ).pipe(timeout(15000)) // 15 second timeout for payment
      //   );
        
      //   console.log('[OrderService] Payment successful:', JSON.stringify(paymentResult));
        
      // } catch (paymentError) {
      //   console.error('[OrderService] Payment failed:', paymentError.message);
      //   throw new RpcException({
      //     message: 'Payment processing failed',
      //     error: paymentError.message,
      //   });
      // }


      // 6. Create Order with status = paid
      const order = this.orderRepository.create({
        userId,
        subtotal,
        tax,
        shippingFee,
        totalPrice,
        shippingAddressId: createOrderDto.shippingAddressId,
        status: OrderStatus.PAID,
        paymentId: paymentResult.transactionId,
      });

      // 7. Save order and return with items
      const savedOrder = await this.orderRepository.save(order);

      console.log('[OrderService] Order saved with ID:', savedOrder.id);

      // Save order items with the order reference
      for (const orderItem of orderItems) {
        orderItem.order = savedOrder;
      }
      await this.orderItemRepository.save(orderItems);

      console.log('[OrderService] Order items saved, count:', orderItems.length);

      // Emit notification AFTER order is saved with full item details
      const notificationPayload = {
        email: user.email,
        name: user.username || 'Customer',
        orderId: savedOrder.id,
        total: totalPrice,
        items: orderItems.map(item => ({
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
      };
      
      console.log('[OrderService] Emitting notification with payload:', JSON.stringify(notificationPayload));
      // this.notificationClient.emit('order_created', notificationPayload);
      try {
        this.getNotificationCircuit.fire(notificationPayload);
      } catch (error) {
        this.logger.error(`Notification service failed: ${error}`)
        throw error;
      }
      
      console.log('[OrderService] Order creation notification emitted');

      // Return the order with items
      const finalOrder = await this.orderRepository.findOne({
        where: { id: savedOrder.id },
        relations: ['items'],
      });

      // 2. MARK COMPLETED - Save successful result to cache
      await this.idempotencyService.markCompleted(
        idempotencyKey,
        'order-service',
        '/order/create',
        finalOrder,
        201, // HTTP status code for created
      );

      return finalOrder;
    } catch (error) {
      console.error('[OrderService] ERROR creating order:', error.message, error.stack);
      
      // 3. MARK FAILED - Allow retry for failed requests
      await this.idempotencyService.markFailed(
        idempotencyKey,
        'order-service',
        '/order/create',
        error.message || 'Failed to create order',
      );

      throw new RpcException({
        message: error.message || 'Failed to create order',
        error: error.toString(),
      });
    }
  }

  async addPaymentRecord(dto: AddPaymentRecordDto) {
    const order = await this.orderRepository.findOne({
      where: { id: dto.orderId },
      relations: ['items'],
    });

    if (!order) {
      throw new RpcException('Order not found');
    }

    // Verify amount matches (convert both to numbers for comparison)
    const orderTotal = typeof order.totalPrice === 'string' 
      ? parseFloat(order.totalPrice) 
      : order.totalPrice;
    const paymentAmount = typeof dto.amount === 'string'
      ? parseFloat(dto.amount)
      : dto.amount;

    if (Math.abs(orderTotal - paymentAmount) > 0.01) { // Allow for small rounding differences
      throw new RpcException(`Payment amount (${paymentAmount}) does not match order total (${orderTotal})`);
    }

    order.paymentId = dto.transactionId;
    order.updatedAt = new Date();

    // Only allow PAID or CANCELLED status updates
    if (dto.paymentStatus === OrderStatus.PAID) {
      order.status = OrderStatus.PAID;
      
      // Emit notification for successful payment
      this.notificationClient.emit('order_paid', {
        orderId: order.id,
        userId: order.userId,
        amount: order.totalPrice,
        transactionId: dto.transactionId,
      });
    } else if (dto.paymentStatus === OrderStatus.CANCELLED || dto.paymentStatus === 'FAILED') {
      order.status = OrderStatus.CANCELLED;
      
      // Emit notification for failed payment
      this.notificationClient.emit('order_payment_failed', {
        orderId: order.id,
        userId: order.userId,
        amount: order.totalPrice,
        reason: 'Payment failed',
      });
    } else {
      throw new RpcException('Invalid payment status');
    }

    return this.orderRepository.save(order);
  }


}
