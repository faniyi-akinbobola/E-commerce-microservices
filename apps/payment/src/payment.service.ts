import { Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';
import { CreateChargeDto } from '@apps/common';

@Injectable()
export class PaymentService {

//   private readonly stripe = new Stripe(this.configService.get<string>('STRIPE_SECRET_KEY'),
// {
//     apiVersion: '2025-11-17.clover',
// })

//   constructor(
//     @Inject('NOTIFICATION_SERVICE') private readonly notificationClient: ClientProxy,
//     private readonly configService: ConfigService
//   ) {}
  private readonly stripe: Stripe;

  constructor(
    private readonly configService: ConfigService,
  ) {
    this.stripe = new Stripe(
      this.configService.get<string>('STRIPE_SECRET_KEY'),
      {
        apiVersion: '2025-11-17.clover',
      },
    );
  }

  async createCharge(data: any) {
    const { amount, currency, charge, userId, description, metadata } = data;
    
    const paymentIntent = await this.stripe.paymentIntents.create({
      payment_method: 'pm_card_visa',
      amount: amount, // Already in smallest currency unit (cents/kobo)
      currency: currency || 'ngn',
      confirm: true,
      description: description || `Payment for user ${userId}`,
      metadata: metadata || {},
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never'
      },
    })

    return paymentIntent;
  }
}
