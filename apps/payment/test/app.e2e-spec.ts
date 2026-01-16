import { Test, TestingModule } from '@nestjs/testing';
import { ClientProxy, ClientsModule, Transport } from '@nestjs/microservices';
import { randomUUID } from 'crypto';

describe('Payment Service E2E Tests', () => {
  let client: ClientProxy;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ClientsModule.register([
          {
            name: 'PAYMENT_SERVICE',
            transport: Transport.RMQ,
            options: {
              urls: ['amqp://localhost:5672'],
              queue: 'payment_queue',
              queueOptions: {
                durable: true,
              },
            },
          },
        ]),
      ],
    }).compile();

    client = moduleFixture.get('PAYMENT_SERVICE');
    await client.connect();

    // Wait for connections to establish
    await new Promise((resolve) => setTimeout(resolve, 2000));
  });

  afterAll(async () => {
    if (client) {
      await client.close();
    }
  });

  describe('Payment Creation - Happy Path', () => {
    it('should successfully create a charge with valid payment data', (done) => {
      const paymentData = {
        amount: 75000, // 750.00 NGN in kobo (meets Stripe minimum ~$0.50)
        currency: 'ngn',
        userId: `user_${Date.now()}`,
        description: 'Test payment for order',
        metadata: {
          orderId: `order_${Date.now()}`,
          productName: 'Test Product',
        },
        idempotencyKey: randomUUID(),
      };

      client.send({ cmd: 'create_charge' }, paymentData).subscribe({
        next: (response) => {
          expect(response).toBeDefined();
          expect(response.transactionId).toBeDefined();
          expect(response.status).toBeDefined();
          expect(response.amount).toBe(paymentData.amount);
          expect(response.currency).toBe(paymentData.currency);
          expect(response.idempotencyKey).toBe(paymentData.idempotencyKey);
          done();
        },
        error: (error) => {
          done(error);
        },
      });
    }, 30000);

    it('should handle payment with minimum valid amount', (done) => {
      const paymentData = {
        amount: 76000, // 760.00 NGN (just above $0.50 minimum for Stripe)
        currency: 'ngn',
        userId: `user_${Date.now()}`,
        description: 'Minimum valid amount payment',
        metadata: {
          testCase: 'minimum_amount',
        },
        idempotencyKey: randomUUID(),
      };

      client.send({ cmd: 'create_charge' }, paymentData).subscribe({
        next: (response) => {
          expect(response).toBeDefined();
          expect(response.amount).toBe(76000);
          expect(response.status).toBeDefined();
          done();
        },
        error: (error) => {
          done(error);
        },
      });
    }, 30000);

    it('should handle payment with large amount', (done) => {
      const paymentData = {
        amount: 5000000, // 50,000.00 NGN
        currency: 'ngn',
        userId: `user_${Date.now()}`,
        description: 'Large amount payment',
        metadata: {
          testCase: 'large_amount',
        },
        idempotencyKey: randomUUID(),
      };

      client.send({ cmd: 'create_charge' }, paymentData).subscribe({
        next: (response) => {
          expect(response).toBeDefined();
          expect(response.amount).toBe(5000000);
          expect(response.transactionId).toBeDefined();
          done();
        },
        error: (error) => {
          done(error);
        },
      });
    }, 30000);

    it('should include custom metadata in payment', (done) => {
      const customMetadata = {
        orderId: `order_${Date.now()}`,
        productId: 'prod_123',
        customerEmail: 'test@example.com',
        shippingAddress: '123 Test St',
      };

      const paymentData = {
        amount: 75000, // Use valid amount
        currency: 'ngn',
        userId: `user_${Date.now()}`,
        description: 'Payment with custom metadata',
        metadata: customMetadata,
        idempotencyKey: randomUUID(),
      };

      client.send({ cmd: 'create_charge' }, paymentData).subscribe({
        next: (response) => {
          expect(response).toBeDefined();
          expect(response.transactionId).toBeDefined();
          expect(response.idempotencyKey).toBeDefined();
          done();
        },
        error: (error) => {
          done(error);
        },
      });
    }, 30000);
  });

  describe('Payment Validation', () => {
    it('should handle missing amount field', (done) => {
      const invalidData = {
        currency: 'ngn',
        userId: `user_${Date.now()}`,
        description: 'Payment without amount',
        idempotencyKey: randomUUID(),
      };

      client.send({ cmd: 'create_charge' }, invalidData).subscribe({
        next: (response) => {
          // Should not succeed
          done(new Error('Should have failed with missing amount'));
        },
        error: (error) => {
          expect(error).toBeDefined();
          expect(error.message || error.error).toBeDefined();
          done();
        },
      });
    }, 30000);

    it('should handle zero amount', (done) => {
      const invalidData = {
        amount: 0,
        currency: 'ngn',
        userId: `user_${Date.now()}`,
        description: 'Payment with zero amount',
        idempotencyKey: randomUUID(),
      };

      client.send({ cmd: 'create_charge' }, invalidData).subscribe({
        next: (response) => {
          // Should not succeed
          done(new Error('Should have failed with zero amount'));
        },
        error: (error) => {
          expect(error).toBeDefined();
          done();
        },
      });
    }, 30000);

    it('should handle negative amount', (done) => {
      const invalidData = {
        amount: -1000,
        currency: 'ngn',
        userId: `user_${Date.now()}`,
        description: 'Payment with negative amount',
        idempotencyKey: randomUUID(),
      };

      client.send({ cmd: 'create_charge' }, invalidData).subscribe({
        next: (response) => {
          // Should not succeed
          done(new Error('Should have failed with negative amount'));
        },
        error: (error) => {
          expect(error).toBeDefined();
          done();
        },
      });
    }, 30000);

    it('should handle amount below Stripe minimum', (done) => {
      const invalidData = {
        amount: 100, // 1.00 NGN - below Stripe minimum of ~$0.50
        currency: 'ngn',
        userId: `user_${Date.now()}`,
        description: 'Payment below minimum',
        idempotencyKey: randomUUID(),
      };

      client.send({ cmd: 'create_charge' }, invalidData).subscribe({
        next: (response) => {
          // Should not succeed due to Stripe minimum
          done(new Error('Should have failed with amount below minimum'));
        },
        error: (error) => {
          expect(error).toBeDefined();
          expect(error.error || error.message).toBeDefined();
          done();
        },
      });
    }, 30000);

    it('should handle missing userId', (done) => {
      const invalidData = {
        amount: 75000, // Use valid amount
        currency: 'ngn',
        description: 'Payment without userId',
        idempotencyKey: randomUUID(),
      };

      client.send({ cmd: 'create_charge' }, invalidData).subscribe({
        next: (response) => {
          // May succeed but without user tracking
          expect(response).toBeDefined();
          done();
        },
        error: (error) => {
          // Also acceptable if service requires userId
          expect(error).toBeDefined();
          done();
        },
      });
    }, 30000);

    it('should handle missing idempotency key', (done) => {
      const paymentData = {
        amount: 75000, // Use valid amount
        currency: 'ngn',
        userId: `user_${Date.now()}`,
        description: 'Payment without idempotency key',
      };

      client.send({ cmd: 'create_charge' }, paymentData).subscribe({
        next: (response) => {
          // Should still work, service may generate one
          expect(response).toBeDefined();
          expect(response.transactionId).toBeDefined();
          done();
        },
        error: (error) => {
          done(error);
        },
      });
    }, 30000);
  });

  describe('Idempotency', () => {
    it('should prevent duplicate charges with same idempotency key', (done) => {
      const idempotencyKey = randomUUID();
      const paymentData = {
        amount: 80000, // Use valid amount
        currency: 'ngn',
        userId: `user_${Date.now()}`,
        description: 'Idempotent payment test',
        metadata: {
          testCase: 'idempotency',
        },
        idempotencyKey,
      };

      // First payment
      client.send({ cmd: 'create_charge' }, paymentData).subscribe({
        next: (firstResponse) => {
          expect(firstResponse).toBeDefined();
          const firstTransactionId = firstResponse.transactionId;

          // Wait a bit before second attempt
          setTimeout(() => {
            // Second payment with same idempotency key
            client.send({ cmd: 'create_charge' }, paymentData).subscribe({
              next: (secondResponse) => {
                expect(secondResponse).toBeDefined();
                // Stripe should return the same transaction ID
                expect(secondResponse.transactionId).toBe(firstTransactionId);
                done();
              },
              error: (error) => {
                done(error);
              },
            });
          }, 2000);
        },
        error: (error) => {
          done(error);
        },
      });
    }, 40000);

    it('should allow different payments with different idempotency keys', (done) => {
      const paymentData1 = {
        amount: 75000, // Use valid amount
        currency: 'ngn',
        userId: `user_${Date.now()}`,
        description: 'First payment',
        idempotencyKey: randomUUID(),
      };

      const paymentData2 = {
        amount: 75000, // Use valid amount
        currency: 'ngn',
        userId: paymentData1.userId,
        description: 'Second payment',
        idempotencyKey: randomUUID(),
      };

      // First payment
      client.send({ cmd: 'create_charge' }, paymentData1).subscribe({
        next: (firstResponse) => {
          expect(firstResponse).toBeDefined();
          const firstTransactionId = firstResponse.transactionId;

          // Second payment with different key
          setTimeout(() => {
            client.send({ cmd: 'create_charge' }, paymentData2).subscribe({
              next: (secondResponse) => {
                expect(secondResponse).toBeDefined();
                // Should have different transaction IDs
                expect(secondResponse.transactionId).not.toBe(firstTransactionId);
                done();
              },
              error: (error) => {
                done(error);
              },
            });
          }, 2000);
        },
        error: (error) => {
          done(error);
        },
      });
    }, 40000);
  });

  describe('Currency Support', () => {
    it('should handle NGN currency', (done) => {
      const paymentData = {
        amount: 80000, // Use valid amount
        currency: 'ngn',
        userId: `user_${Date.now()}`,
        description: 'NGN payment',
        idempotencyKey: randomUUID(),
      };

      client.send({ cmd: 'create_charge' }, paymentData).subscribe({
        next: (response) => {
          expect(response).toBeDefined();
          expect(response.currency).toBe('ngn');
          done();
        },
        error: (error) => {
          done(error);
        },
      });
    }, 30000);

    it('should use NGN as default currency when not specified', (done) => {
      const paymentData = {
        amount: 80000, // Use valid amount
        userId: `user_${Date.now()}`,
        description: 'Payment without currency',
        idempotencyKey: randomUUID(),
      };

      client.send({ cmd: 'create_charge' }, paymentData).subscribe({
        next: (response) => {
          expect(response).toBeDefined();
          expect(response.currency).toBe('ngn');
          done();
        },
        error: (error) => {
          done(error);
        },
      });
    }, 30000);
  });

  describe('Error Handling', () => {
    it('should handle empty payment data', (done) => {
      client.send({ cmd: 'create_charge' }, {}).subscribe({
        next: (response) => {
          done(new Error('Should have failed with empty data'));
        },
        error: (error) => {
          expect(error).toBeDefined();
          done();
        },
      });
    }, 30000);

    it('should handle null payment data', (done) => {
      client.send({ cmd: 'create_charge' }, null).subscribe({
        next: (response) => {
          done(new Error('Should have failed with null data'));
        },
        error: (error) => {
          expect(error).toBeDefined();
          done();
        },
      });
    }, 30000);

    it('should handle malformed payment data', (done) => {
      const malformedData = {
        amount: 'not_a_number',
        currency: 123,
        userId: null,
        description: { invalid: 'object' },
      };

      client.send({ cmd: 'create_charge' }, malformedData).subscribe({
        next: (response) => {
          done(new Error('Should have failed with malformed data'));
        },
        error: (error) => {
          expect(error).toBeDefined();
          done();
        },
      });
    }, 30000);

    it('should handle very large amount beyond limits', (done) => {
      const paymentData = {
        amount: 999999999999, // Extremely large amount
        currency: 'ngn',
        userId: `user_${Date.now()}`,
        description: 'Payment with excessive amount',
        idempotencyKey: randomUUID(),
      };

      client.send({ cmd: 'create_charge' }, paymentData).subscribe({
        next: (response) => {
          // May succeed or fail depending on Stripe limits
          expect(response).toBeDefined();
          done();
        },
        error: (error) => {
          // Expected to fail with amount limit error
          expect(error).toBeDefined();
          done();
        },
      });
    }, 30000);
  });

  describe('Multiple Payments', () => {
    it('should handle multiple sequential payments', (done) => {
      const payments = [
        { amount: 75000, userId: `user_${Date.now()}`, idempotencyKey: randomUUID() },
        { amount: 80000, userId: `user_${Date.now()}`, idempotencyKey: randomUUID() },
        { amount: 85000, userId: `user_${Date.now()}`, idempotencyKey: randomUUID() },
      ];

      let completed = 0;
      const responses = [];

      payments.forEach((paymentData, index) => {
        setTimeout(() => {
          client
            .send(
              { cmd: 'create_charge' },
              {
                ...paymentData,
                currency: 'ngn',
                description: `Sequential payment ${index + 1}`,
              },
            )
            .subscribe({
              next: (response) => {
                expect(response).toBeDefined();
                responses.push(response);
                completed++;

                if (completed === payments.length) {
                  expect(responses).toHaveLength(3);
                  // All should have unique transaction IDs
                  const transactionIds = responses.map((r) => r.transactionId);
                  const uniqueIds = new Set(transactionIds);
                  expect(uniqueIds.size).toBe(3);
                  done();
                }
              },
              error: (error) => {
                done(error);
              },
            });
        }, index * 3000); // 3 second delay between each
      });
    }, 50000);
  });

  describe('Description and Metadata', () => {
    it('should handle payment with custom description', (done) => {
      const paymentData = {
        amount: 75000, // Use valid amount
        currency: 'ngn',
        userId: `user_${Date.now()}`,
        description: 'Custom description for important purchase',
        idempotencyKey: randomUUID(),
      };

      client.send({ cmd: 'create_charge' }, paymentData).subscribe({
        next: (response) => {
          expect(response).toBeDefined();
          expect(response.transactionId).toBeDefined();
          done();
        },
        error: (error) => {
          done(error);
        },
      });
    }, 30000);

    it('should handle payment without description', (done) => {
      const paymentData = {
        amount: 75000, // Use valid amount
        currency: 'ngn',
        userId: `user_${Date.now()}`,
        idempotencyKey: randomUUID(),
      };

      client.send({ cmd: 'create_charge' }, paymentData).subscribe({
        next: (response) => {
          expect(response).toBeDefined();
          expect(response.transactionId).toBeDefined();
          done();
        },
        error: (error) => {
          done(error);
        },
      });
    }, 30000);

    it('should handle payment with empty metadata', (done) => {
      const paymentData = {
        amount: 75000, // Use valid amount
        currency: 'ngn',
        userId: `user_${Date.now()}`,
        description: 'Payment with empty metadata',
        metadata: {},
        idempotencyKey: randomUUID(),
      };

      client.send({ cmd: 'create_charge' }, paymentData).subscribe({
        next: (response) => {
          expect(response).toBeDefined();
          expect(response.transactionId).toBeDefined();
          done();
        },
        error: (error) => {
          done(error);
        },
      });
    }, 30000);

    it('should handle payment with complex metadata', (done) => {
      const paymentData = {
        amount: 75000, // Use valid amount
        currency: 'ngn',
        userId: `user_${Date.now()}`,
        description: 'Payment with complex metadata',
        metadata: {
          orderId: `order_${Date.now()}`,
          items: 'item1,item2,item3',
          customerTier: 'premium',
          shippingMethod: 'express',
          promocode: 'SAVE10',
        },
        idempotencyKey: randomUUID(),
      };

      client.send({ cmd: 'create_charge' }, paymentData).subscribe({
        next: (response) => {
          expect(response).toBeDefined();
          expect(response.transactionId).toBeDefined();
          done();
        },
        error: (error) => {
          done(error);
        },
      });
    }, 30000);
  });
});
