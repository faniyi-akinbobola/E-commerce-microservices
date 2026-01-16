import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';

describe('Order Service E2E Tests', () => {
  let client: ClientProxy;
  let authClient: ClientProxy;
  let productClient: ClientProxy;
  let testUserId: string;
  let testAddressId: string;
  let testProductId: string;
  let accessToken: string;

  beforeAll(async () => {
    // Create a RabbitMQ client to communicate with the order service
    client = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
        queue: 'order_queue',
        queueOptions: {
          durable: true,
        },
      },
    });

    // Auth client for creating test user and address
    authClient = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
        queue: 'auth_queue',
        queueOptions: {
          durable: true,
        },
      },
    });

    // Product client for creating test products
    productClient = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
        queue: 'product_queue',
        queueOptions: {
          durable: true,
        },
      },
    });

    await client.connect();
    await authClient.connect();
    await productClient.connect();

    // Wait for connections
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Setup: Create test user and address
    const testUser = {
      email: `ordertest_${Date.now()}@test.com`,
      password: 'Test@123456',
      username: `orderuser_${Date.now()}`,
    };

    const signupResponse = await new Promise((resolve, reject) => {
      authClient.send({ cmd: 'signup' }, testUser).subscribe({
        next: (response) => resolve(response),
        error: (error) => reject(error),
      });
    });

    testUserId = (signupResponse as any).user.id;
    accessToken = (signupResponse as any).accessToken;

    // Create a test address
    const addressResponse = await new Promise((resolve, reject) => {
      authClient
        .send(
          { cmd: 'create_user_address' },
          {
            userId: testUserId,
            fullName: 'Test User',
            street: '123 Test Street',
            city: 'Test City',
            state: 'Test State',
            postalCode: '12345',
            country: 'Test Country',
            phone: '+1234567890',
            isDefault: true,
          },
        )
        .subscribe({
          next: (response) => resolve(response),
          error: (error) => reject(error),
        });
    });

    testAddressId = (addressResponse as any).id;

    // Create a test category first
    const testCategory = {
      name: `Test Category ${Date.now()}`,
      description: 'Test category for order tests',
    };

    const categoryResponse = await new Promise((resolve, reject) => {
      productClient.send({ cmd: 'create_category' }, testCategory).subscribe({
        next: (response) => resolve(response),
        error: (error) => reject(error),
      });
    });

    const testCategoryId = (categoryResponse as any)._id;

    // Create a test product
    const testProduct = {
      name: `Test Product ${Date.now()}`,
      description: 'Test product for order tests',
      price: 10000, // 100 NGN
      categoryIds: [testCategoryId],
      stock: 100,
      images: ['test-image.jpg'],
      brand: 'TestBrand',
    };

    const productResponse = await new Promise((resolve, reject) => {
      productClient.send({ cmd: 'create_product' }, testProduct).subscribe({
        next: (response) => resolve(response),
        error: (error) => reject(error),
      });
    });

    testProductId = (productResponse as any)._id || (productResponse as any).id;
  }, 60000);

  afterAll(async () => {
    await client.close();
    await authClient.close();
    await productClient.close();
  });

  describe('Create Order', () => {
    it('should create an order successfully', (done) => {
      const createOrderDto = {
        shippingAddressId: testAddressId,
        items: [
          {
            productId: testProductId,
            quantity: 2,
          },
        ],
        charge: {
          amount: 100000, // 1000 NGN in kobo
          currency: 'NGN',
          email: `ordertest_${Date.now()}@test.com`,
        },
      };

      const idempotencyKey = `order_create_${Date.now()}`;

      client
        .send({ cmd: 'create_order' }, { userId: testUserId, dto: createOrderDto, idempotencyKey })
        .subscribe({
          next: (response) => {
            expect(response).toBeDefined();
            expect(response.id).toBeDefined();
            expect(response.userId).toBe(testUserId);
            expect(response.status).toBe('PAID'); // Status is PAID after successful payment
            expect(response.shippingAddressId).toBe(createOrderDto.shippingAddressId);
            expect(response.totalPrice).toBeDefined();
            expect(response.items).toBeDefined();
            expect(response.items.length).toBeGreaterThan(0);
            done();
          },
          error: (error) => done(error),
        });
    }, 30000);

    it('should handle idempotency for order creation', (done) => {
      const createOrderDto = {
        shippingAddressId: testAddressId,
        items: [
          {
            productId: testProductId,
            quantity: 1,
          },
        ],
        charge: {
          amount: 150000,
          currency: 'NGN',
          email: `ordertest2_${Date.now()}@test.com`,
        },
      };

      const idempotencyKey = `order_idem_${Date.now()}`;

      // First request
      client
        .send({ cmd: 'create_order' }, { userId: testUserId, dto: createOrderDto, idempotencyKey })
        .subscribe({
          next: (response1) => {
            expect(response1).toBeDefined();
            const firstOrderId = response1.id;

            // Second request with same idempotency key
            setTimeout(() => {
              client
                .send(
                  { cmd: 'create_order' },
                  { userId: testUserId, dto: createOrderDto, idempotencyKey },
                )
                .subscribe({
                  next: (response2) => {
                    expect(response2).toBeDefined();
                    expect(response2.id).toBe(firstOrderId); // Should be the same order
                    done();
                  },
                  error: (error) => done(error),
                });
            }, 1000);
          },
          error: (error) => done(error),
        });
    }, 40000);

    it('should handle missing shipping address', (done) => {
      const createOrderDto = {
        shippingAddressId: '', // Invalid
        items: [
          {
            productId: testProductId,
            quantity: 1,
          },
        ],
        charge: {
          amount: 100000,
          currency: 'NGN',
          email: 'test@example.com',
        },
      };

      const idempotencyKey = `order_invalid_${Date.now()}`;

      client
        .send({ cmd: 'create_order' }, { userId: testUserId, dto: createOrderDto, idempotencyKey })
        .subscribe({
          next: () => done(new Error('Should have thrown an error')),
          error: (error) => {
            expect(error).toBeDefined();
            done();
          },
        });
    }, 15000);
  });

  describe('Get Order', () => {
    let createdOrderId: string;

    beforeAll((done) => {
      // Create an order first
      const createOrderDto = {
        shippingAddressId: testAddressId,
        items: [
          {
            productId: testProductId,
            quantity: 3,
          },
        ],
        charge: {
          amount: 200000,
          currency: 'NGN',
          email: `gettest_${Date.now()}@test.com`,
        },
      };

      const idempotencyKey = `order_get_setup_${Date.now()}`;

      client
        .send({ cmd: 'create_order' }, { userId: testUserId, dto: createOrderDto, idempotencyKey })
        .subscribe({
          next: (response) => {
            createdOrderId = response.id;
            done();
          },
          error: (error) => done(error),
        });
    }, 30000);

    it('should retrieve order by ID', (done) => {
      client.send({ cmd: 'get_order_by_id' }, createdOrderId).subscribe({
        next: (response) => {
          expect(response).toBeDefined();
          expect(response.id).toBe(createdOrderId);
          expect(response.status).toBeDefined();
          expect(response.totalPrice).toBeDefined();
          done();
        },
        error: (error) => done(error),
      });
    }, 15000);

    it('should handle non-existent order ID', (done) => {
      const fakeOrderId = 'fake-order-id-12345';

      client.send({ cmd: 'get_order_by_id' }, fakeOrderId).subscribe({
        next: () => done(new Error('Should have thrown an error')),
        error: (error) => {
          expect(error).toBeDefined();
          done();
        },
      });
    }, 15000);

    it('should retrieve all orders', (done) => {
      client.send({ cmd: 'get_all_orders' }, {}).subscribe({
        next: (response) => {
          expect(response).toBeDefined();
          expect(Array.isArray(response)).toBe(true);
          expect(response.length).toBeGreaterThan(0);
          done();
        },
        error: (error) => done(error),
      });
    }, 15000);

    it('should retrieve user orders', (done) => {
      client.send({ cmd: 'get_user_orders' }, testUserId).subscribe({
        next: (response) => {
          expect(response).toBeDefined();
          expect(Array.isArray(response)).toBe(true);
          expect(response.length).toBeGreaterThan(0);
          expect(response[0].userId).toBe(testUserId);
          done();
        },
        error: (error) => done(error),
      });
    }, 15000);
  });

  describe('Update Order Status', () => {
    let orderToUpdate: any;

    beforeAll((done) => {
      // Create an order first
      const createOrderDto = {
        shippingAddressId: testAddressId,
        items: [
          {
            productId: testProductId,
            quantity: 1,
          },
        ],
        charge: {
          amount: 300000,
          currency: 'NGN',
          email: `updatetest_${Date.now()}@test.com`,
        },
      };

      const idempotencyKey = `order_update_setup_${Date.now()}`;

      client
        .send({ cmd: 'create_order' }, { userId: testUserId, dto: createOrderDto, idempotencyKey })
        .subscribe({
          next: (response) => {
            orderToUpdate = response;
            done();
          },
          error: (error) => done(error),
        });
    }, 30000);

    it('should update order status successfully', (done) => {
      const updateDto = {
        orderId: orderToUpdate.id,
        status: 'PAID',
      };

      const idempotencyKey = `update_status_${Date.now()}`;

      client.send({ cmd: 'update_order_status' }, { dto: updateDto, idempotencyKey }).subscribe({
        next: (response) => {
          expect(response).toBeDefined();
          expect(response.id).toBe(orderToUpdate.id);
          expect(response.status).toBe('PAID');
          done();
        },
        error: (error) => done(error),
      });
    }, 20000);

    it('should handle idempotency for status updates', (done) => {
      const updateDto = {
        orderId: orderToUpdate.id,
        status: 'SHIPPED',
      };

      const idempotencyKey = `update_idem_${Date.now()}`;

      // First update
      client.send({ cmd: 'update_order_status' }, { dto: updateDto, idempotencyKey }).subscribe({
        next: (response1) => {
          expect(response1.status).toBe('SHIPPED');

          // Second update with same idempotency key
          setTimeout(() => {
            client
              .send({ cmd: 'update_order_status' }, { dto: updateDto, idempotencyKey })
              .subscribe({
                next: (response2) => {
                  expect(response2).toBeDefined();
                  expect(response2.status).toBe('SHIPPED');
                  done();
                },
                error: (error) => done(error),
              });
          }, 1000);
        },
        error: (error) => done(error),
      });
    }, 30000);

    it('should handle invalid order ID for status update', (done) => {
      const updateDto = {
        orderId: 'invalid-order-id',
        status: 'PAID',
      };

      const idempotencyKey = `update_invalid_${Date.now()}`;

      client.send({ cmd: 'update_order_status' }, { dto: updateDto, idempotencyKey }).subscribe({
        next: () => done(new Error('Should have thrown an error')),
        error: (error) => {
          expect(error).toBeDefined();
          done();
        },
      });
    }, 15000);
  });

  describe('Cancel Order', () => {
    let orderToCancel: any;

    beforeAll((done) => {
      // Create an order first
      const createOrderDto = {
        shippingAddressId: testAddressId,
        items: [
          {
            productId: testProductId,
            quantity: 1,
          },
        ],
        charge: {
          amount: 350000,
          currency: 'NGN',
          email: `canceltest_${Date.now()}@test.com`,
        },
      };

      const idempotencyKey = `order_cancel_setup_${Date.now()}`;

      client
        .send({ cmd: 'create_order' }, { userId: testUserId, dto: createOrderDto, idempotencyKey })
        .subscribe({
          next: (response) => {
            orderToCancel = response;
            done();
          },
          error: (error) => done(error),
        });
    }, 30000);

    it('should cancel order successfully', (done) => {
      const cancelDto = {
        orderId: orderToCancel.id,
      };

      const idempotencyKey = `cancel_order_${Date.now()}`;

      client
        .send({ cmd: 'cancel_order' }, { userId: testUserId, dto: cancelDto, idempotencyKey })
        .subscribe({
          next: (response) => {
            expect(response).toBeDefined();
            expect(response.id).toBe(orderToCancel.id);
            expect(response.status).toBe('CANCELLED');
            done();
          },
          error: (error) => done(error),
        });
    }, 20000);

    it('should handle idempotency for order cancellation', (done) => {
      // Create another order for this test
      const createOrderDto = {
        shippingAddressId: testAddressId,
        items: [
          {
            productId: testProductId,
            quantity: 1,
          },
        ],
        charge: {
          amount: 400000,
          currency: 'NGN',
          email: `cancelidem_${Date.now()}@test.com`,
        },
      };

      const createKey = `order_cancel_idem_setup_${Date.now()}`;

      client
        .send(
          { cmd: 'create_order' },
          { userId: testUserId, dto: createOrderDto, idempotencyKey: createKey },
        )
        .subscribe({
          next: (newOrder) => {
            const cancelDto = {
              orderId: newOrder.id,
            };

            const idempotencyKey = `cancel_idem_${Date.now()}`;

            // First cancellation
            client
              .send({ cmd: 'cancel_order' }, { userId: testUserId, dto: cancelDto, idempotencyKey })
              .subscribe({
                next: (response1) => {
                  expect(response1.status).toBe('CANCELLED');

                  // Second cancellation with same idempotency key
                  setTimeout(() => {
                    client
                      .send(
                        { cmd: 'cancel_order' },
                        { userId: testUserId, dto: cancelDto, idempotencyKey },
                      )
                      .subscribe({
                        next: (response2) => {
                          expect(response2).toBeDefined();
                          expect(response2.status).toBe('CANCELLED');
                          done();
                        },
                        error: (error) => done(error),
                      });
                  }, 1000);
                },
                error: (error) => done(error),
              });
          },
          error: (error) => done(error),
        });
    }, 45000);

    it('should not cancel shipped order', (done) => {
      // Create and ship an order
      const createOrderDto = {
        shippingAddressId: testAddressId,
        items: [
          {
            productId: testProductId,
            quantity: 1,
          },
        ],
        charge: {
          amount: 450000,
          currency: 'NGN',
          email: `shipped_${Date.now()}@test.com`,
        },
      };

      const createKey = `order_shipped_setup_${Date.now()}`;

      client
        .send(
          { cmd: 'create_order' },
          { userId: testUserId, dto: createOrderDto, idempotencyKey: createKey },
        )
        .subscribe({
          next: (newOrder) => {
            // Update status to SHIPPED
            const updateDto = {
              orderId: newOrder.id,
              status: 'SHIPPED',
            };

            const updateKey = `update_shipped_${Date.now()}`;

            client
              .send({ cmd: 'update_order_status' }, { dto: updateDto, idempotencyKey: updateKey })
              .subscribe({
                next: () => {
                  // Now try to cancel
                  setTimeout(() => {
                    const cancelDto = {
                      orderId: newOrder.id,
                    };

                    const cancelKey = `cancel_shipped_${Date.now()}`;

                    client
                      .send(
                        { cmd: 'cancel_order' },
                        { userId: testUserId, dto: cancelDto, idempotencyKey: cancelKey },
                      )
                      .subscribe({
                        next: () =>
                          done(new Error('Should not allow cancellation of shipped order')),
                        error: (error) => {
                          expect(error).toBeDefined();
                          done();
                        },
                      });
                  }, 500);
                },
                error: (error) => done(error),
              });
          },
          error: (error) => done(error),
        });
    }, 45000);

    it('should handle unauthorized cancellation', (done) => {
      const cancelDto = {
        orderId: orderToCancel.id,
      };

      const wrongUserId = 'wrong-user-id';
      const idempotencyKey = `cancel_unauth_${Date.now()}`;

      client
        .send({ cmd: 'cancel_order' }, { userId: wrongUserId, dto: cancelDto, idempotencyKey })
        .subscribe({
          next: () => done(new Error('Should have thrown an error')),
          error: (error) => {
            expect(error).toBeDefined();
            done();
          },
        });
    }, 15000);
  });

  describe('Complex Order Workflows', () => {
    it('should handle complete order lifecycle', (done) => {
      const createOrderDto = {
        shippingAddressId: testAddressId,
        items: [
          {
            productId: testProductId,
            quantity: 5,
          },
        ],
        charge: {
          amount: 500000,
          currency: 'NGN',
          email: `lifecycle_${Date.now()}@test.com`,
        },
      };

      const createKey = `order_lifecycle_${Date.now()}`;

      // Step 1: Create order
      client
        .send(
          { cmd: 'create_order' },
          { userId: testUserId, dto: createOrderDto, idempotencyKey: createKey },
        )
        .subscribe({
          next: (order) => {
            expect(order.status).toBe('PAID'); // Order starts as PAID after payment processing

            // Step 2: Mark as SHIPPED
            setTimeout(() => {
              const updateShippedDto = {
                orderId: order.id,
                status: 'SHIPPED',
              };

              const shippedKey = `lifecycle_shipped_${Date.now()}`;

              client
                .send(
                  { cmd: 'update_order_status' },
                  { dto: updateShippedDto, idempotencyKey: shippedKey },
                )
                .subscribe({
                  next: (shippedOrder) => {
                    expect(shippedOrder.status).toBe('SHIPPED');

                    // Step 3: Mark as DELIVERED
                    setTimeout(() => {
                      const updateShippedDto = {
                        orderId: order.id,
                        status: 'SHIPPED',
                      };

                      const shippedKey = `lifecycle_shipped_${Date.now()}`;

                      client
                        .send(
                          { cmd: 'update_order_status' },
                          { dto: updateShippedDto, idempotencyKey: shippedKey },
                        )
                        .subscribe({
                          next: (shippedOrder) => {
                            expect(shippedOrder.status).toBe('SHIPPED');

                            // Step 4: Mark as DELIVERED
                            setTimeout(() => {
                              const updateDeliveredDto = {
                                orderId: order.id,
                                status: 'DELIVERED',
                              };

                              const deliveredKey = `lifecycle_delivered_${Date.now()}`;

                              client
                                .send(
                                  { cmd: 'update_order_status' },
                                  { dto: updateDeliveredDto, idempotencyKey: deliveredKey },
                                )
                                .subscribe({
                                  next: (deliveredOrder) => {
                                    expect(deliveredOrder.status).toBe('DELIVERED');
                                    done();
                                  },
                                  error: (error) => done(error),
                                });
                            }, 500);
                          },
                          error: (error) => done(error),
                        });
                    }, 500);
                  },
                  error: (error) => done(error),
                });
            }, 500);
          },
          error: (error) => done(error),
        });
    }, 60000);

    it('should handle multiple orders for same user', (done) => {
      const order1Dto = {
        shippingAddressId: testAddressId,
        items: [
          {
            productId: testProductId,
            quantity: 1,
          },
        ],
        charge: {
          amount: 100000,
          currency: 'NGN',
          email: `multi1_${Date.now()}@test.com`,
        },
      };

      const order2Dto = {
        shippingAddressId: testAddressId,
        items: [
          {
            productId: testProductId,
            quantity: 2,
          },
        ],
        charge: {
          amount: 200000,
          currency: 'NGN',
          email: `multi2_${Date.now()}@test.com`,
        },
      };

      const key1 = `order_multi_1_${Date.now()}`;
      const key2 = `order_multi_2_${Date.now()}`;

      // Create first order
      client
        .send({ cmd: 'create_order' }, { userId: testUserId, dto: order1Dto, idempotencyKey: key1 })
        .subscribe({
          next: (order1) => {
            expect(order1).toBeDefined();

            // Create second order
            setTimeout(() => {
              client
                .send(
                  { cmd: 'create_order' },
                  { userId: testUserId, dto: order2Dto, idempotencyKey: key2 },
                )
                .subscribe({
                  next: (order2) => {
                    expect(order2).toBeDefined();

                    // Verify both orders exist for user
                    setTimeout(() => {
                      client.send({ cmd: 'get_user_orders' }, testUserId).subscribe({
                        next: (orders) => {
                          expect(orders.length).toBeGreaterThanOrEqual(2);
                          done();
                        },
                        error: (error) => done(error),
                      });
                    }, 500);
                  },
                  error: (error) => done(error),
                });
            }, 500);
          },
          error: (error) => done(error),
        });
    }, 45000);
  });
});
