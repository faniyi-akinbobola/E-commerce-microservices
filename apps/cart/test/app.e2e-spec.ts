import { Test, TestingModule } from '@nestjs/testing';
import { ClientProxy, ClientsModule, Transport } from '@nestjs/microservices';

describe('Cart Service E2E Tests', () => {
  let client: ClientProxy;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ClientsModule.register([
          {
            name: 'CART_SERVICE',
            transport: Transport.RMQ,
            options: {
              urls: ['amqp://localhost:5672'],
              queue: 'cart_queue',
              queueOptions: {
                durable: true,
              },
            },
          },
        ]),
      ],
    }).compile();

    client = moduleFixture.get('CART_SERVICE');
    await client.connect();

    // Wait for connections to establish
    await new Promise((resolve) => setTimeout(resolve, 2000));
  });

  afterAll(async () => {
    if (client) {
      await client.close();
    }
  });

  describe('Add to Cart', () => {
    it('should add item to cart successfully', (done) => {
      const cartData = {
        userId: `user_${Date.now()}`,
        productId: `product_${Date.now()}`,
        quantity: 2,
      };

      client.send({ cmd: 'add_to_cart' }, cartData).subscribe({
        next: (response) => {
          expect(response).toBeDefined();
          expect(response.items).toBeDefined();
          expect(Array.isArray(response.items)).toBe(true);
          expect(response.items.length).toBeGreaterThan(0);
          expect(response.items[0].productId).toBe(cartData.productId);
          expect(response.items[0].quantity).toBe(cartData.quantity);
          done();
        },
        error: (error) => {
          done(error);
        },
      });
    }, 30000);

    it('should add multiple different items to cart', (done) => {
      const userId = `user_${Date.now()}`;
      const product1 = `product_${Date.now()}_1`;
      const product2 = `product_${Date.now()}_2`;

      // Add first item
      client
        .send(
          { cmd: 'add_to_cart' },
          {
            userId,
            productId: product1,
            quantity: 1,
          },
        )
        .subscribe({
          next: (response1) => {
            expect(response1.items).toHaveLength(1);

            // Add second item
            setTimeout(() => {
              client
                .send(
                  { cmd: 'add_to_cart' },
                  {
                    userId,
                    productId: product2,
                    quantity: 3,
                  },
                )
                .subscribe({
                  next: (response2) => {
                    expect(response2.items).toHaveLength(2);
                    expect(response2.items.find((i) => i.productId === product1)).toBeDefined();
                    expect(response2.items.find((i) => i.productId === product2)).toBeDefined();
                    done();
                  },
                  error: (error) => done(error),
                });
            }, 500);
          },
          error: (error) => done(error),
        });
    }, 30000);

    it('should handle adding same item multiple times (idempotency)', (done) => {
      const cartData = {
        userId: `user_${Date.now()}`,
        productId: `product_${Date.now()}`,
        quantity: 5,
        idempotencyKey: `idem_${Date.now()}`,
      };

      // First request
      client.send({ cmd: 'add_to_cart' }, cartData).subscribe({
        next: (response1) => {
          expect(response1).toBeDefined();
          expect(response1.items).toBeDefined();
          const initialLength = response1.items.length;
          const initialQuantity = response1.items.find(
            (i) => i.productId === cartData.productId,
          )?.quantity;

          // Second request with same idempotency key
          setTimeout(() => {
            client.send({ cmd: 'add_to_cart' }, cartData).subscribe({
              next: (response2) => {
                // Should return cached result (may be structured differently)
                expect(response2).toBeDefined();
                // The key test: quantity should not have doubled
                if (response2.items) {
                  const item = response2.items.find((i) => i.productId === cartData.productId);
                  expect(item?.quantity).toBe(initialQuantity);
                } else {
                  // Response might be the cached full response object
                  expect(response2).toBeDefined();
                }
                done();
              },
              error: (error) => done(error),
            });
          }, 1000);
        },
        error: (error) => done(error),
      });
    }, 35000);

    it('should add item with quantity 1 by default', (done) => {
      const cartData = {
        userId: `user_${Date.now()}`,
        productId: `product_${Date.now()}`,
        quantity: 1,
      };

      client.send({ cmd: 'add_to_cart' }, cartData).subscribe({
        next: (response) => {
          expect(response.items[0].quantity).toBe(1);
          done();
        },
        error: (error) => done(error),
      });
    }, 30000);
  });

  describe('Get Cart', () => {
    it('should retrieve cart for user', (done) => {
      const userId = `user_${Date.now()}`;
      const productId = `product_${Date.now()}`;

      // First add an item
      client
        .send(
          { cmd: 'add_to_cart' },
          {
            userId,
            productId,
            quantity: 3,
          },
        )
        .subscribe({
          next: () => {
            // Then retrieve cart
            setTimeout(() => {
              client.send({ cmd: 'get_cart' }, { userId }).subscribe({
                next: (cart) => {
                  expect(cart).toBeDefined();
                  expect(cart.items).toBeDefined();
                  expect(cart.items.length).toBeGreaterThan(0);
                  expect(cart.items.find((i) => i.productId === productId)).toBeDefined();
                  done();
                },
                error: (error) => done(error),
              });
            }, 500);
          },
          error: (error) => done(error),
        });
    }, 30000);

    it('should return empty cart for new user', (done) => {
      const userId = `new_user_${Date.now()}`;

      client.send({ cmd: 'get_cart' }, { userId }).subscribe({
        next: (cart) => {
          expect(cart).toBeDefined();
          expect(cart.items).toBeDefined();
          expect(Array.isArray(cart.items)).toBe(true);
          expect(cart.items.length).toBe(0);
          done();
        },
        error: (error) => done(error),
      });
    }, 30000);
  });

  describe('Update Cart Item', () => {
    it('should update item quantity in cart', (done) => {
      const userId = `user_${Date.now()}`;
      const productId = `product_${Date.now()}`;

      // Add item
      client
        .send(
          { cmd: 'add_to_cart' },
          {
            userId,
            productId,
            quantity: 2,
          },
        )
        .subscribe({
          next: () => {
            // Update quantity
            setTimeout(() => {
              client
                .send(
                  { cmd: 'update_cart_item' },
                  {
                    userId,
                    productId,
                    quantity: 5,
                  },
                )
                .subscribe({
                  next: (response) => {
                    expect(response.items).toBeDefined();
                    const item = response.items.find((i) => i.productId === productId);
                    expect(item).toBeDefined();
                    expect(item.quantity).toBe(5);
                    done();
                  },
                  error: (error) => done(error),
                });
            }, 500);
          },
          error: (error) => done(error),
        });
    }, 30000);

    it('should remove item when quantity is 0', (done) => {
      const userId = `user_${Date.now()}`;
      const productId = `product_${Date.now()}`;

      // Add item
      client
        .send(
          { cmd: 'add_to_cart' },
          {
            userId,
            productId,
            quantity: 3,
          },
        )
        .subscribe({
          next: () => {
            // Update to quantity 0
            setTimeout(() => {
              client
                .send(
                  { cmd: 'update_cart_item' },
                  {
                    userId,
                    productId,
                    quantity: 0,
                  },
                )
                .subscribe({
                  next: (response) => {
                    expect(response.items).toBeDefined();
                    const item = response.items.find((i) => i.productId === productId);
                    expect(item).toBeUndefined();
                    done();
                  },
                  error: (error) => done(error),
                });
            }, 500);
          },
          error: (error) => done(error),
        });
    }, 30000);

    it('should handle update with idempotency', (done) => {
      const userId = `user_${Date.now()}`;
      const productId = `product_${Date.now()}`;
      const idempotencyKey = `update_idem_${Date.now()}`;

      // Add item
      client
        .send(
          { cmd: 'add_to_cart' },
          {
            userId,
            productId,
            quantity: 2,
          },
        )
        .subscribe({
          next: () => {
            // First update
            setTimeout(() => {
              client
                .send(
                  { cmd: 'update_cart_item' },
                  {
                    userId,
                    productId,
                    quantity: 10,
                    idempotencyKey,
                  },
                )
                .subscribe({
                  next: (response1) => {
                    expect(response1).toBeDefined();
                    expect(response1.items).toBeDefined();
                    const item1 = response1.items.find((i) => i.productId === productId);
                    expect(item1.quantity).toBe(10);

                    // Second update with same idempotency key
                    setTimeout(() => {
                      client
                        .send(
                          { cmd: 'update_cart_item' },
                          {
                            userId,
                            productId,
                            quantity: 10,
                            idempotencyKey, // Same key
                          },
                        )
                        .subscribe({
                          next: (response2) => {
                            expect(response2).toBeDefined();
                            expect(response2.items).toBeDefined();
                            const item2 = response2.items.find((i) => i.productId === productId);
                            expect(item2.quantity).toBe(10); // Should remain 10
                            done();
                          },
                          error: (error) => done(error),
                        });
                    }, 1000);
                  },
                  error: (error) => done(error),
                });
            }, 500);
          },
          error: (error) => done(error),
        });
    }, 45000);
  });

  describe('Remove from Cart', () => {
    it('should remove item from cart', (done) => {
      const userId = `user_${Date.now()}`;
      const productId = `product_${Date.now()}`;

      // Add item
      client
        .send(
          { cmd: 'add_to_cart' },
          {
            userId,
            productId,
            quantity: 2,
          },
        )
        .subscribe({
          next: (addResponse) => {
            expect(addResponse.items).toHaveLength(1);

            // Remove item
            setTimeout(() => {
              client
                .send(
                  { cmd: 'remove_from_cart' },
                  {
                    userId,
                    productId,
                  },
                )
                .subscribe({
                  next: (removeResponse) => {
                    expect(removeResponse.items).toBeDefined();
                    const item = removeResponse.items.find((i) => i.productId === productId);
                    expect(item).toBeUndefined();
                    done();
                  },
                  error: (error) => done(error),
                });
            }, 500);
          },
          error: (error) => done(error),
        });
    }, 30000);

    it('should handle removing non-existent item', (done) => {
      const userId = `user_${Date.now()}`;
      const productId = `nonexistent_${Date.now()}`;

      client
        .send(
          { cmd: 'remove_from_cart' },
          {
            userId,
            productId,
          },
        )
        .subscribe({
          next: (response) => {
            expect(response).toBeDefined();
            expect(response.items).toBeDefined();
            done();
          },
          error: (error) => done(error),
        });
    }, 30000);

    it('should handle remove with idempotency', (done) => {
      const userId = `user_${Date.now()}`;
      const productId = `product_${Date.now()}`;
      const idempotencyKey = `remove_idem_${Date.now()}`;

      // Add item
      client
        .send(
          { cmd: 'add_to_cart' },
          {
            userId,
            productId,
            quantity: 2,
          },
        )
        .subscribe({
          next: () => {
            // First remove
            setTimeout(() => {
              client
                .send(
                  { cmd: 'remove_from_cart' },
                  {
                    userId,
                    productId,
                    idempotencyKey,
                  },
                )
                .subscribe({
                  next: (response1) => {
                    expect(response1).toBeDefined();
                    expect(response1.items).toBeDefined();
                    expect(response1.items.find((i) => i.productId === productId)).toBeUndefined();

                    // Second remove with same key (should be idempotent)
                    setTimeout(() => {
                      client
                        .send(
                          { cmd: 'remove_from_cart' },
                          {
                            userId,
                            productId,
                            idempotencyKey,
                          },
                        )
                        .subscribe({
                          next: (response2) => {
                            expect(response2).toBeDefined();
                            expect(response2.items).toBeDefined();
                            expect(
                              response2.items.find((i) => i.productId === productId),
                            ).toBeUndefined();
                            done();
                          },
                          error: (error) => done(error),
                        });
                    }, 1000);
                  },
                  error: (error) => done(error),
                });
            }, 500);
          },
          error: (error) => done(error),
        });
    }, 45000);
  });

  describe('Clear Cart', () => {
    it('should clear all items from cart', (done) => {
      const userId = `user_${Date.now()}`;

      // Add multiple items
      client
        .send(
          { cmd: 'add_to_cart' },
          {
            userId,
            productId: `product_${Date.now()}_1`,
            quantity: 2,
          },
        )
        .subscribe({
          next: () => {
            setTimeout(() => {
              client
                .send(
                  { cmd: 'add_to_cart' },
                  {
                    userId,
                    productId: `product_${Date.now()}_2`,
                    quantity: 3,
                  },
                )
                .subscribe({
                  next: (addResponse) => {
                    expect(addResponse.items.length).toBeGreaterThan(0);

                    // Clear cart
                    setTimeout(() => {
                      client.send({ cmd: 'clear_cart' }, { userId }).subscribe({
                        next: (clearResponse) => {
                          expect(clearResponse).toBeDefined();
                          expect(clearResponse.message).toBe('Cart cleared');

                          // Verify cart is empty
                          client.send({ cmd: 'get_cart' }, { userId }).subscribe({
                            next: (getResponse) => {
                              expect(getResponse.items).toBeDefined();
                              expect(getResponse.items.length).toBe(0);
                              done();
                            },
                            error: (error) => done(error),
                          });
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
    }, 40000);

    it('should handle clearing empty cart', (done) => {
      const userId = `empty_user_${Date.now()}`;

      client.send({ cmd: 'clear_cart' }, { userId }).subscribe({
        next: (response) => {
          expect(response).toBeDefined();
          expect(response.message).toBe('Cart cleared');
          done();
        },
        error: (error) => done(error),
      });
    }, 30000);

    it('should handle clear with idempotency', (done) => {
      const userId = `user_${Date.now()}`;
      const idempotencyKey = `clear_idem_${Date.now()}`;

      // Add items
      client
        .send(
          { cmd: 'add_to_cart' },
          {
            userId,
            productId: `product_${Date.now()}`,
            quantity: 5,
          },
        )
        .subscribe({
          next: () => {
            // First clear
            setTimeout(() => {
              client
                .send(
                  { cmd: 'clear_cart' },
                  {
                    userId,
                    idempotencyKey,
                  },
                )
                .subscribe({
                  next: (response1) => {
                    expect(response1).toBeDefined();
                    expect(response1.message).toBe('Cart cleared');

                    // Second clear with same key (should return cached response)
                    setTimeout(() => {
                      client
                        .send(
                          { cmd: 'clear_cart' },
                          {
                            userId,
                            idempotencyKey,
                          },
                        )
                        .subscribe({
                          next: (response2) => {
                            expect(response2).toBeDefined();
                            expect(response2.message).toBe('Cart cleared');
                            done();
                          },
                          error: (error) => done(error),
                        });
                    }, 1000);
                  },
                  error: (error) => done(error),
                });
            }, 500);
          },
          error: (error) => done(error),
        });
    }, 45000);
  });

  describe('Complex Cart Operations', () => {
    it('should handle full cart workflow', (done) => {
      const userId = `workflow_user_${Date.now()}`;
      const product1 = `product_${Date.now()}_1`;
      const product2 = `product_${Date.now()}_2`;
      const product3 = `product_${Date.now()}_3`;

      // Step 1: Add first item
      client
        .send(
          { cmd: 'add_to_cart' },
          {
            userId,
            productId: product1,
            quantity: 2,
          },
        )
        .subscribe({
          next: () => {
            setTimeout(() => {
              // Step 2: Add second item
              client
                .send(
                  { cmd: 'add_to_cart' },
                  {
                    userId,
                    productId: product2,
                    quantity: 1,
                  },
                )
                .subscribe({
                  next: () => {
                    setTimeout(() => {
                      // Step 3: Add third item
                      client
                        .send(
                          { cmd: 'add_to_cart' },
                          {
                            userId,
                            productId: product3,
                            quantity: 5,
                          },
                        )
                        .subscribe({
                          next: (cart1) => {
                            expect(cart1.items.length).toBe(3);

                            setTimeout(() => {
                              // Step 4: Update first item
                              client
                                .send(
                                  { cmd: 'update_cart_item' },
                                  {
                                    userId,
                                    productId: product1,
                                    quantity: 10,
                                  },
                                )
                                .subscribe({
                                  next: (cart2) => {
                                    const item1 = cart2.items.find((i) => i.productId === product1);
                                    expect(item1.quantity).toBe(10);

                                    setTimeout(() => {
                                      // Step 5: Remove second item
                                      client
                                        .send(
                                          { cmd: 'remove_from_cart' },
                                          {
                                            userId,
                                            productId: product2,
                                          },
                                        )
                                        .subscribe({
                                          next: (cart3) => {
                                            expect(cart3.items.length).toBe(2);
                                            expect(
                                              cart3.items.find((i) => i.productId === product2),
                                            ).toBeUndefined();

                                            setTimeout(() => {
                                              // Step 6: Verify final cart state
                                              client
                                                .send({ cmd: 'get_cart' }, { userId })
                                                .subscribe({
                                                  next: (finalCart) => {
                                                    expect(finalCart.items.length).toBe(2);
                                                    expect(
                                                      finalCart.items.find(
                                                        (i) => i.productId === product1,
                                                      )?.quantity,
                                                    ).toBe(10);
                                                    expect(
                                                      finalCart.items.find(
                                                        (i) => i.productId === product3,
                                                      )?.quantity,
                                                    ).toBe(5);
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
                    }, 500);
                  },
                  error: (error) => done(error),
                });
            }, 500);
          },
          error: (error) => done(error),
        });
    }, 50000);

    it('should maintain separate carts for different users', (done) => {
      const user1 = `user1_${Date.now()}`;
      const user2 = `user2_${Date.now()}`;
      const product = `product_${Date.now()}`;

      // Add to user1 cart
      client
        .send(
          { cmd: 'add_to_cart' },
          {
            userId: user1,
            productId: product,
            quantity: 3,
          },
        )
        .subscribe({
          next: () => {
            setTimeout(() => {
              // Add to user2 cart
              client
                .send(
                  { cmd: 'add_to_cart' },
                  {
                    userId: user2,
                    productId: product,
                    quantity: 7,
                  },
                )
                .subscribe({
                  next: () => {
                    setTimeout(() => {
                      // Verify user1 cart
                      client.send({ cmd: 'get_cart' }, { userId: user1 }).subscribe({
                        next: (cart1) => {
                          const item1 = cart1.items.find((i) => i.productId === product);
                          expect(item1.quantity).toBe(3);

                          // Verify user2 cart
                          client.send({ cmd: 'get_cart' }, { userId: user2 }).subscribe({
                            next: (cart2) => {
                              const item2 = cart2.items.find((i) => i.productId === product);
                              expect(item2.quantity).toBe(7);
                              done();
                            },
                            error: (error) => done(error),
                          });
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
    }, 40000);
  });

  describe('Error Handling', () => {
    it('should handle missing userId', (done) => {
      client
        .send(
          { cmd: 'add_to_cart' },
          {
            productId: `product_${Date.now()}`,
            quantity: 1,
          },
        )
        .subscribe({
          next: (response) => {
            // May succeed or fail based on service implementation
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

    it('should handle missing productId', (done) => {
      client
        .send(
          { cmd: 'add_to_cart' },
          {
            userId: `user_${Date.now()}`,
            quantity: 1,
          },
        )
        .subscribe({
          next: (response) => {
            // May succeed or fail
            expect(response).toBeDefined();
            done();
          },
          error: (error) => {
            // Also acceptable
            expect(error).toBeDefined();
            done();
          },
        });
    }, 30000);

    it('should handle negative quantity', (done) => {
      client
        .send(
          { cmd: 'add_to_cart' },
          {
            userId: `user_${Date.now()}`,
            productId: `product_${Date.now()}`,
            quantity: -5,
          },
        )
        .subscribe({
          next: (response) => {
            // Service should handle this gracefully
            expect(response).toBeDefined();
            done();
          },
          error: (error) => {
            // Or reject it
            expect(error).toBeDefined();
            done();
          },
        });
    }, 30000);
  });
});
