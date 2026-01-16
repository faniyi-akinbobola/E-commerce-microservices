# API Gateway E2E Tests

This directory contains end-to-end tests for the API Gateway service.

## Overview

The e2e tests validate the entire request flow through the API Gateway to the microservices, ensuring all integrations work correctly.

## Test Coverage

### 1. Authentication Flows

- ✅ User registration with validation
- ✅ User login with JWT token generation
- ✅ User profile retrieval
- ✅ Invalid credentials handling
- ✅ Unauthorized access prevention

### 2. Address Management

- ✅ Create new shipping address
- ✅ Get all user addresses
- ✅ Update existing address
- ✅ Delete address

### 3. Product Operations

- ✅ Get all products
- ✅ Get all categories
- ✅ Get products by category
- ✅ Get product by ID
- ✅ Search products by query

### 4. Cart Operations

- ✅ Add item to cart
- ✅ Get cart contents
- ✅ Update cart item quantity
- ✅ Remove item from cart
- ✅ Clear entire cart
- ✅ Unauthorized access prevention

### 5. Order Operations

- ✅ Create order from cart
- ✅ Create order with explicit items
- ✅ Get all user orders
- ✅ Get specific order by ID
- ✅ Update order status
- ✅ Cancel order
- ✅ Unauthorized access prevention

### 6. Error Handling

- ✅ Invalid product ID handling
- ✅ Non-existent routes (404)
- ✅ Request validation errors
- ✅ Circuit breaker fallbacks

## Prerequisites

Before running the tests, ensure:

1. **All services are running:**

   ```bash
   docker-compose up -d
   ```

2. **Services are healthy:**
   - RabbitMQ is running and healthy
   - PostgreSQL databases are up
   - MongoDB is running
   - All microservices are connected

3. **Wait for initialization:**
   - Allow 30-60 seconds for all services to initialize
   - Check logs: `docker-compose logs -f`

## Running the Tests

### Run all e2e tests:

```bash
npm run test:e2e:gateway
```

### Run with verbose output:

```bash
npm run test:e2e:gateway -- --verbose
```

### Run specific test suite:

```bash
npm run test:e2e:gateway -- -t "Authentication Flows"
```

### Run in watch mode (for development):

```bash
npm run test:e2e:gateway -- --watch
```

## Test Flow

The tests follow a realistic user journey:

1. **User Registration** → Creates a new test user with unique credentials
2. **User Login** → Obtains authentication token
3. **Address Creation** → Sets up shipping address
4. **Product Browsing** → Views products and categories
5. **Cart Management** → Adds items, updates quantities
6. **Order Placement** → Creates orders from cart or explicit items
7. **Order Management** → Views, updates, and cancels orders
8. **Cleanup** → Removes cart items and addresses

## Configuration

### Jest Configuration (`jest-e2e.json`)

- **testTimeout**: 60000ms (60 seconds) - Allows time for service communication
- **maxWorkers**: 1 - Runs tests sequentially to avoid race conditions
- **verbose**: true - Provides detailed test output

### Test Data

- Email: `e2etest{timestamp}@test.com`
- Username: `e2euser{timestamp}`
- Password: `Test@123456`

All test data uses timestamps to ensure uniqueness across test runs.

## Troubleshooting

### Tests failing with timeouts

- Increase `testTimeout` in `jest-e2e.json`
- Check if all services are running: `docker-compose ps`
- Check service logs: `docker-compose logs [service-name]`

### Authentication failures

- Ensure auth service is running and connected to RabbitMQ
- Check JWT configuration in `.env` files
- Verify database connections

### Product-related test failures

- Ensure product service has seeded data
- Check MongoDB connection
- Verify product service is responding: `docker-compose logs product-service`

### Order creation failures

- Ensure payment service is configured with Stripe test keys
- Check inventory service for stock availability
- Verify order service database migrations

### Circuit breaker issues

- Check RabbitMQ connection health
- Verify all microservices are responding
- Review circuit breaker timeout configurations

## Best Practices

1. **Always run with services up**: E2E tests require all microservices to be running
2. **Run tests sequentially**: Use `--runInBand` to avoid race conditions
3. **Clean test data**: Tests are designed to be idempotent and clean up after themselves
4. **Check logs on failure**: Use `docker-compose logs` to debug service issues
5. **Use unique test data**: Timestamps ensure each test run uses fresh data

## CI/CD Integration

For CI/CD pipelines:

```bash
# Start services
docker-compose up -d

# Wait for services to be ready
sleep 30

# Run tests
npm run test:e2e:gateway

# Cleanup
docker-compose down
```

## Adding New Tests

When adding new tests:

1. Group related tests in `describe` blocks
2. Use `beforeAll` for one-time setup
3. Use `afterAll` for cleanup
4. Store IDs (userId, orderId, etc.) for dependent tests
5. Add proper assertions with meaningful messages
6. Handle async operations with `async/await`

Example:

```typescript
describe('New Feature', () => {
  it('should perform action', async () => {
    const response = await request(app.getHttpServer())
      .post('/endpoint')
      .set('Authorization', `Bearer ${authToken}`)
      .send(payload)
      .expect(201);

    expect(response.body.data).toHaveProperty('expectedField');
  });
});
```

## Related Documentation

- [API Routes Documentation](../../../API_ROUTES.md)
- [Testing Guide](../../../TESTING_GUIDE.md)
- [Postman Payloads](../../../POSTMAN_PAYLOADS_FINAL.md)
