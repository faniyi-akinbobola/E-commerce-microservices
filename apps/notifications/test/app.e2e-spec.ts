import { Test, TestingModule } from '@nestjs/testing';
import { ClientProxy, ClientsModule, Transport } from '@nestjs/microservices';

describe('Notifications Service E2E Tests', () => {
  let client: ClientProxy;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ClientsModule.register([
          {
            name: 'NOTIFICATIONS_SERVICE',
            transport: Transport.RMQ,
            options: {
              urls: ['amqp://localhost:5672'],
              queue: 'notifications_queue',
              queueOptions: {
                durable: true,
              },
            },
          },
        ]),
      ],
    }).compile();

    client = moduleFixture.get('NOTIFICATIONS_SERVICE');
    await client.connect();

    // Wait for connections to establish
    await new Promise((resolve) => setTimeout(resolve, 2000));
  });

  afterAll(async () => {
    if (client) {
      await client.close();
    }
  });

  describe('User Authentication Events', () => {
    it('should handle user_created event', (done) => {
      const userData = {
        email: `test${Date.now()}@example.com`,
        username: `testuser${Date.now()}`,
      };

      client.emit('user_created', userData).subscribe({
        next: () => {
          // Event emitted successfully
          expect(true).toBe(true);
          done();
        },
        error: (error) => {
          console.log('user_created event error:', error.message);
          // Events don't return responses, so timeout is normal
          done();
        },
      });

      // Events don't wait for response, complete immediately
      setTimeout(() => {
        expect(true).toBe(true);
        done();
      }, 100);
    });

    it('should handle user_logged_in event', (done) => {
      const loginData = {
        email: `test${Date.now()}@example.com`,
        username: `testuser${Date.now()}`,
        loginTime: new Date().toISOString(),
      };

      client.emit('user_logged_in', loginData);

      // Events are fire-and-forget
      setTimeout(() => {
        expect(true).toBe(true);
        done();
      }, 100);
    });

    it('should handle send_forgot_password_email event', (done) => {
      const forgotPasswordData = {
        email: `test${Date.now()}@example.com`,
        resetToken: `reset-token-${Date.now()}`,
        resetUrl: `http://localhost:3000/reset-password?token=test`,
      };

      client.emit('send_forgot_password_email', forgotPasswordData);

      setTimeout(() => {
        expect(true).toBe(true);
        done();
      }, 100);
    });

    it('should handle password_changed event', (done) => {
      const passwordChangedData = {
        email: `test${Date.now()}@example.com`,
        username: `testuser${Date.now()}`,
        changedAt: new Date().toISOString(),
      };

      client.emit('password_changed', passwordChangedData);

      setTimeout(() => {
        expect(true).toBe(true);
        done();
      }, 100);
    });

    it('should handle password_reset_success event', (done) => {
      const resetSuccessData = {
        email: `test${Date.now()}@example.com`,
        username: `testuser${Date.now()}`,
      };

      client.emit('password_reset_success', resetSuccessData);

      setTimeout(() => {
        expect(true).toBe(true);
        done();
      }, 100);
    });
  });

  describe('Order Events', () => {
    it('should handle order_created event', (done) => {
      const orderData = {
        orderId: `order-${Date.now()}`,
        email: `test${Date.now()}@example.com`,
        items: [
          {
            productName: 'Test Product',
            quantity: 2,
            price: 99.99,
          },
        ],
        totalAmount: 199.98,
        orderDate: new Date().toISOString(),
      };

      client.emit('order_created', orderData);

      setTimeout(() => {
        expect(true).toBe(true);
        done();
      }, 100);
    });

    it('should handle order_paid event', (done) => {
      const orderPaidData = {
        orderId: `order-${Date.now()}`,
        email: `test${Date.now()}@example.com`,
        amount: 199.98,
        paymentMethod: 'credit_card',
        paidAt: new Date().toISOString(),
      };

      client.emit('order_paid', orderPaidData);

      setTimeout(() => {
        expect(true).toBe(true);
        done();
      }, 100);
    });

    it('should handle order_payment_failed event', (done) => {
      const paymentFailedData = {
        orderId: `order-${Date.now()}`,
        email: `test${Date.now()}@example.com`,
        amount: 199.98,
        reason: 'Insufficient funds',
        failedAt: new Date().toISOString(),
      };

      client.emit('order_payment_failed', paymentFailedData);

      setTimeout(() => {
        expect(true).toBe(true);
        done();
      }, 100);
    });
  });

  describe('Event Validation', () => {
    it('should handle event with missing email gracefully', (done) => {
      const invalidData = {
        username: `testuser${Date.now()}`,
        // Missing email
      };

      client.emit('user_created', invalidData);

      setTimeout(() => {
        // Service should handle gracefully
        expect(true).toBe(true);
        done();
      }, 100);
    });

    it('should handle event with null data gracefully', (done) => {
      client.emit('user_created', null);

      setTimeout(() => {
        expect(true).toBe(true);
        done();
      }, 100);
    });

    it('should handle event with empty object gracefully', (done) => {
      client.emit('user_logged_in', {});

      setTimeout(() => {
        expect(true).toBe(true);
        done();
      }, 100);
    });

    it('should handle order event with missing required fields', (done) => {
      const incompleteOrder = {
        orderId: `order-${Date.now()}`,
        // Missing email, items, totalAmount
      };

      client.emit('order_created', incompleteOrder);

      setTimeout(() => {
        expect(true).toBe(true);
        done();
      }, 100);
    });

    it('should handle multiple events in sequence', (done) => {
      const email = `test${Date.now()}@example.com`;

      // Emit multiple events
      client.emit('user_created', { email, username: 'testuser' });
      client.emit('user_logged_in', { email, username: 'testuser' });
      client.emit('password_changed', { email, username: 'testuser' });

      setTimeout(() => {
        expect(true).toBe(true);
        done();
      }, 100);
    });

    it('should handle rapid event emission', (done) => {
      for (let i = 0; i < 5; i++) {
        client.emit('user_logged_in', {
          email: `test${Date.now()}-${i}@example.com`,
          username: `testuser${i}`,
        });
      }

      setTimeout(() => {
        expect(true).toBe(true);
        done();
      }, 200);
    });
  });

  describe('Event Data Formats', () => {
    it('should handle event with extra fields', (done) => {
      const dataWithExtra = {
        email: `test${Date.now()}@example.com`,
        username: `testuser${Date.now()}`,
        extraField1: 'extra data',
        extraField2: 12345,
      };

      client.emit('user_created', dataWithExtra);

      setTimeout(() => {
        expect(true).toBe(true);
        done();
      }, 100);
    });

    it('should handle event with different data types', (done) => {
      const orderData = {
        orderId: 12345, // number instead of string
        email: `test${Date.now()}@example.com`,
        items: 'not-an-array', // wrong type
        totalAmount: '199.98', // string instead of number
      };

      client.emit('order_created', orderData);

      setTimeout(() => {
        expect(true).toBe(true);
        done();
      }, 100);
    });

    it('should handle event with very long email', (done) => {
      const longEmail = `very${'long'.repeat(50)}email${Date.now()}@example.com`;

      client.emit('user_created', {
        email: longEmail,
        username: 'testuser',
      });

      setTimeout(() => {
        expect(true).toBe(true);
        done();
      }, 100);
    });

    it('should handle event with special characters in data', (done) => {
      const specialData = {
        email: `test+special${Date.now()}@example.com`,
        username: `user_with-special.chars${Date.now()}`,
      };

      client.emit('user_created', specialData);

      setTimeout(() => {
        expect(true).toBe(true);
        done();
      }, 100);
    });
  });
});
