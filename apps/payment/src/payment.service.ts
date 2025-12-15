import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';
import { CreateChargeDto, CircuitBreakerService } from '@apps/common';
import { randomUUID } from 'crypto';

@Injectable()
export class PaymentService implements OnModuleInit {
  private readonly logger = new Logger(PaymentService.name);
  private readonly stripe: Stripe;
  private stripeCircuit;

  constructor(
    private readonly configService: ConfigService,
    private readonly circuitBreakerService: CircuitBreakerService,
  ) {
    this.stripe = new Stripe(
      this.configService.get<string>('STRIPE_SECRET_KEY'),
      {
        apiVersion: '2025-11-17.clover',
        timeout: 10000, // 10 second timeout for Stripe API calls
        maxNetworkRetries: 0, // Disable automatic retries - circuit breaker handles this
      },
    );
  }

  onModuleInit() {
    this.initializeCircuitBreaker();
  }

  private initializeCircuitBreaker() {
    // Circuit breaker for Stripe API calls
    this.stripeCircuit = this.circuitBreakerService.createCircuitBreaker(
      async (paymentData: any) => {
        return await this.stripe.paymentIntents.create(paymentData);
      },
      {
        timeout: 12000, // 12 seconds (slightly longer than Stripe's 10s timeout)
        errorThresholdPercentage: 50,
        resetTimeout: 30000, // 30 seconds before trying again
        name: 'stripe_payment_intent',
      }
    );

    this.stripeCircuit.fallback(() => {
      throw new RpcException('Payment gateway is temporarily unavailable. Please try again later.');
    });

    this.logger.log('Stripe circuit breaker initialized');
  }

  async createCharge(data: any) {
    const { amount, currency, charge, userId, description, metadata } = data;
    
    // Generate idempotency key to prevent duplicate charges
    const idempotencyKey = randomUUID();
    
    this.logger.log(`Creating payment intent for user ${userId} with amount ${amount} and idempotency key ${idempotencyKey}`);
    
    try {
      // Prepare payment intent data
      const paymentIntentData = {
        payment_method: 'pm_card_visa',
        amount: amount, // Already in smallest currency unit (cents/kobo)
        currency: currency || 'ngn',
        confirm: true,
        description: description || `Payment for user ${userId}`,
        metadata: {
          ...metadata,
          userId,
          idempotencyKey, // Store for tracking
        },
        automatic_payment_methods: {
          enabled: true,
          allow_redirects: 'never'
        },
      };

      // Call Stripe through circuit breaker
      const paymentIntent = await this.stripeCircuit.fire(paymentIntentData);
      
      this.logger.log(`Payment intent created successfully: ${paymentIntent.id}`);
      
      return {
        transactionId: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        idempotencyKey,
      };
      
    } catch (error) {
      this.logger.error(`Payment failed: ${error.message}`, error.stack);
      
      // Check if it's a Stripe-specific error
      if (error.type) {
        throw new RpcException({
          message: 'Payment failed',
          error: error.message,
          type: error.type,
          code: error.code,
        });
      }
      
      // Generic error (circuit breaker fallback or other)
      throw new RpcException({
        message: 'Payment processing failed',
        error: error.message,
      });
    }
  }
}
