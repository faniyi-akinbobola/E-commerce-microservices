# Idempotency Implementation Guide

## Overview

Idempotency ensures that making the same request multiple times has the same effect as making it once. This is critical for financial operations, order creation, and any state-changing operations.

## When to Use Idempotency

Apply idempotency to **ALL POST and PUT routes** that:

- Create resources (orders, payments, users, etc.)
- Update critical data (payment status, order status, etc.)
- Trigger side effects (emails, notifications, webhooks, etc.)
- Process financial transactions

## The Three Methods Explained

### 1. `checkIdempotency()` - Call at the START of your method

**Purpose:** Check if this request has already been processed or is being processed.

**Returns:**

- `{ exists: false }` - New request, proceed with operation
- `{ exists: true, status: 'completed', data: ... }` - Already done, return cached result
- `{ exists: true, status: 'pending' }` - Concurrent request, throw error
- `{ exists: true, status: 'failed' }` - Previous attempt failed, allow retry

**When to use:** FIRST thing in your method, before any database queries or external API calls.

**Example:**

```typescript
const idempotencyCheck = await this.idempotencyService.checkIdempotency(
  idempotencyKey,
  'order-service', // Service name
  '/order/create', // Endpoint
  createOrderDto, // Request body for logging
);

// Return cached result if already completed
if (idempotencyCheck.exists && idempotencyCheck.status === 'completed') {
  return idempotencyCheck.data;
}

// Throw error if concurrent request
if (idempotencyCheck.exists && idempotencyCheck.status === 'pending') {
  throw new RpcException('Request is already being processed. Please wait.');
}
```

---

### 2. `markCompleted()` - Call AFTER successful operation

**Purpose:** Save the successful result so duplicate requests can return it immediately.

**Parameters:**

- `key` - The idempotency key
- `serviceName` - Name of your service (e.g., 'order-service')
- `endpoint` - The endpoint path (e.g., '/order/create')
- `responseData` - The successful result to cache
- `statusCode` (optional) - HTTP status code (e.g., 201)

**When to use:** After all operations succeed, just before returning the result.

**Example:**

```typescript
// Create order and save to database
const order = await this.orderRepository.save(newOrder);

// Mark as completed BEFORE returning
await this.idempotencyService.markCompleted(
  idempotencyKey,
  'order-service',
  '/order/create',
  order,
  201,
);

return order;
```

---

### 3. `markFailed()` - Call in the CATCH block

**Purpose:** Mark the request as failed so it can be retried.

**Parameters:**

- `key` - The idempotency key
- `serviceName` - Name of your service
- `endpoint` - The endpoint path
- `errorMessage` - Error description

**When to use:** In your catch block, before throwing the error.

**Example:**

```typescript
try {
  // Your operation
} catch (error) {
  // Mark as failed to allow retry
  await this.idempotencyService.markFailed(
    idempotencyKey,
    'order-service',
    '/order/create',
    error.message || 'Failed to create order',
  );

  throw error; // Re-throw to let caller handle
}
```

---

## Complete Implementation Pattern

```typescript
async createSomething(dto: CreateDto, idempotencyKey: string) {
  try {
    // 1. CHECK IDEMPOTENCY FIRST
    const check = await this.idempotencyService.checkIdempotency(
      idempotencyKey,
      'my-service',
      '/endpoint/path',
      dto,
    );

    if (check.exists && check.status === 'completed') {
      return check.data; // Return cached result
    }

    if (check.exists && check.status === 'pending') {
      throw new RpcException('Request already in progress');
    }

    // 2. PERFORM YOUR BUSINESS LOGIC
    // - Database operations
    // - External API calls
    // - Any state changes
    const result = await this.performOperation(dto);

    // 3. MARK COMPLETED before returning
    await this.idempotencyService.markCompleted(
      idempotencyKey,
      'my-service',
      '/endpoint/path',
      result,
      201,
    );

    return result;

  } catch (error) {
    // 4. MARK FAILED in catch block
    await this.idempotencyService.markFailed(
      idempotencyKey,
      'my-service',
      '/endpoint/path',
      error.message,
    );

    throw error;
  }
}
```

---

## Routes That Need Idempotency

### Order Service

- ✅ `createOrder()` - Already implemented
- [ ] `updateOrderStatus()`
- [ ] `cancelOrder()`

### Payment Service

- [ ] `processPayment()`
- [ ] `refundPayment()`
- [ ] `updatePaymentStatus()`

### Inventory Service

- [ ] `reserveStock()`
- [ ] `releaseStock()`
- [ ] `updateStock()`

### Cart Service

- [ ] `addToCart()`
- [ ] `updateCartItem()`
- [ ] `removeFromCart()`

### Auth Service

- [ ] `register()`
- [ ] `createAddress()`
- [ ] `updateAddress()`

---

## Important Notes

1. **Idempotency Key Generation:**
   - API Gateway should generate the key if client doesn't provide one
   - Use UUIDv4 or similar
   - Pass it to services via headers or DTO

2. **Concurrent Requests:**
   - Status 'pending' prevents duplicate processing
   - Client should wait and not retry immediately

3. **Failed Requests:**
   - Status 'failed' allows retries
   - Client can retry with the same idempotency key

4. **Expiration:**
   - Records expire after 24 hours
   - Call `cleanupExpired()` periodically (daily cron job)

5. **Response Caching:**
   - Only cache successful responses
   - Failed requests can be retried
   - Pending requests indicate concurrent processing

---

## Testing Idempotency

Test with the same idempotency key multiple times:

```bash
# First request - should succeed
curl -X POST http://localhost:3000/order \
  -H "Content-Type: application/json" \
  -H "X-Idempotency-Key: test-key-123" \
  -d '{"items": [...]}'

# Second request - should return cached result
curl -X POST http://localhost:3000/order \
  -H "Content-Type: application/json" \
  -H "X-Idempotency-Key: test-key-123" \
  -d '{"items": [...]}'

# Result: Only ONE order created, both requests return same response
```

---

## Next Steps

1. Apply this pattern to all POST/PUT routes listed above
2. Test each endpoint with duplicate requests
3. Set up a cron job to call `cleanupExpired()` daily
4. Monitor logs for 'Idempotent request detected' messages
