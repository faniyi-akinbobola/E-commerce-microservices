# Row Locking + Idempotency Implementation Guide

## ✅ What We Implemented in `reduceStock`

I've implemented a production-ready `reduceStock` method in your Inventory Service that combines:

1. **Database Idempotency** (from common library)
2. **Row Locking** (PostgreSQL pessimistic write lock)
3. **Transaction Management** (atomic operations)

---

## 📚 Full Explanation - How It Works

### **1. Shared Idempotency Module**

**Yes, it uses the SAME IdempotencyModule from the common library!**

```typescript
// In inventory.module.ts
import { IdempotencyModule } from '@apps/common';

@Module({
  imports: [
    IdempotencyModule, // ✅ Import from common library
    // ...other imports
  ],
})
```

**Why this works:**

- The `IdempotencyModule` is in your common library (`libs/common/src/idempotency/`)
- It exports `IdempotencyService` which any service can inject
- It uses the `IdempotencyRequest` entity (stored in PostgreSQL)
- All services share the same idempotency database table
- This ensures consistent idempotency across your entire microservices architecture

---

### **2. Transaction with Query Runner**

```typescript
const queryRunner = this.dataSource.createQueryRunner();
await queryRunner.connect();
await queryRunner.startTransaction();
```

**What this does:**

- Creates a database connection for this specific operation
- Starts a transaction (all operations succeed together or fail together)
- Ensures atomicity - either ALL changes are saved or NONE are saved

**When to use:**

- ✅ Any operation that modifies multiple records
- ✅ Critical operations (payments, stock, orders)
- ✅ When you need row locking
- ❌ Simple read operations (waste of resources)

---

### **3. The 7-Step Process**

#### **STEP 1: Check Idempotency**

```typescript
const idempotencyCheck = await this.idempotencyService.checkIdempotency(
  idempotencyKey,
  'inventory-service',
  '/inventory/reduce-stock',
  reduceStockDto,
);
```

**What happens:**

- Checks if request was already processed
- Creates a `pending` record if it's new
- Returns cached result if already `completed`
- Throws error if status is `pending` (concurrent request)

**Why at the start:**

- Prevents unnecessary database operations
- Fast rejection of duplicate requests
- No need to acquire locks if request was already completed

---

#### **STEP 2: Lock the Row**

```typescript
const inventory = await queryRunner.manager.findOne(Inventory, {
  where: { productId: reduceStockDto.productId },
  lock: { mode: 'pessimistic_write' }, // ✅ EXCLUSIVE LOCK
});
```

**What happens:**

- PostgreSQL locks this specific inventory row
- No other transaction can read or write this row until lock is released
- Other requests attempting to lock this row will WAIT (queue up)
- Lock is automatically released when transaction commits/rollbacks

**Lock Modes:**

- `pessimistic_read`: Others can read but not write (shared lock)
- `pessimistic_write`: Others cannot read or write (exclusive lock) ✅ **We use this**

**Why pessimistic_write:**

- Stock reduction is critical - we need exclusive access
- Prevents race conditions (two requests reducing stock simultaneously)
- Ensures accurate stock counts

**Real-world scenario:**

```
Time  | Request A (User 1)              | Request B (User 2)
------|----------------------------------|----------------------------------
T1    | Locks inventory row             | Tries to lock, WAITS
T2    | Checks stock: 10 available      | Still waiting...
T3    | Reduces stock: 10 - 5 = 5       | Still waiting...
T4    | Saves inventory                 | Still waiting...
T5    | Commits, releases lock          | Lock acquired!
T6    |                                  | Checks stock: 5 available ✅
T7    |                                  | Reduces stock: 5 - 3 = 2
T8    |                                  | Commits

Result: Both operations succeed with correct stock count (2)
Without locking: Both might see 10, both reduce, final stock = 5 (wrong!)
```

---

#### **STEP 3: Validate Stock**

```typescript
if (inventory.quantity < reduceStockDto.quantity) {
  await queryRunner.rollbackTransaction();
  await queryRunner.release();
  throw new RpcException('Insufficient stock');
}
```

**What happens:**

- Check if sufficient stock is available (while holding the lock)
- If not enough, rollback transaction and release lock immediately
- Throw error to caller

**Why after locking:**

- Ensures we check the most up-to-date stock value
- No other transaction can change stock while we're checking

---

#### **STEP 4: Reduce Stock**

```typescript
inventory.quantity -= reduceStockDto.quantity;
inventory.updatedAt = new Date();
await queryRunner.manager.save(Inventory, inventory);
```

**What happens:**

- Modify the inventory object in memory
- Save to database within the transaction
- Changes are not visible to other transactions yet (isolation)

**Why within transaction:**

- Changes can still be rolled back if later steps fail
- Atomic with other operations

---

#### **STEP 5: Update Product (MongoDB)**

```typescript
const product = await this.productRepository.findOne({...});
product.stock -= reduceStockDto.quantity;
const updatedProduct = await this.productRepository.save(product);
```

**What happens:**

- Update the product stock in MongoDB
- MongoDB operation is separate from PostgreSQL transaction

**⚠️ Important Note:**

- PostgreSQL transactions don't cover MongoDB operations
- If this fails, PostgreSQL transaction will rollback
- For production, consider:
  - **Saga Pattern** (compensating transactions)
  - **MongoDB Transactions** (if using replica set)
  - **Event Sourcing** (publish events after commit)

---

#### **STEP 6: Mark Completed**

```typescript
await this.idempotencyService.markCompleted(
  idempotencyKey,
  'inventory-service',
  '/inventory/reduce-stock',
  reduceStockDto,
  updatedProduct,
  200,
);
```

**What happens:**

- Updates the idempotency record status to `completed`
- Stores the result (updatedProduct) for future duplicate requests
- Sets HTTP status code (200)

**Why before commit:**

- If commit fails, transaction will rollback including this
- Ensures idempotency record matches actual database state

---

#### **STEP 7: Commit Transaction**

```typescript
await queryRunner.commitTransaction();
await queryRunner.release();
return updatedProduct;
```

**What happens:**

- Makes all changes permanent in the database
- Releases the row lock - other waiting transactions can proceed
- Closes the database connection
- Returns the result

**What commit does:**

- Makes changes visible to other transactions
- Releases all locks acquired during transaction
- Cannot be undone after this point

---

### **4. Error Handling (The Catch Block)**

```typescript
catch (error) {
  await queryRunner.rollbackTransaction();
  await queryRunner.release();

  await this.idempotencyService.markFailed(
    idempotencyKey,
    'inventory-service',
    '/inventory/reduce-stock',
    error.message,
  );

  throw error;
}
```

**What happens:**

- **Rollback:** Undoes all database changes made in this transaction
- **Release:** Frees the connection and releases locks immediately
- **Mark Failed:** Updates idempotency record to allow retry
- **Re-throw:** Lets caller handle the error

**Why this order:**

1. Rollback first - revert database changes
2. Release connection - free resources
3. Mark failed - allow client to retry
4. Throw error - inform caller

---

## 🎯 How to Apply This Pattern to Other Methods

### **Template for Any Critical Operation:**

```typescript
async yourMethod(dto: YourDto, idempotencyKey: string): Promise<YourEntity> {
  // 1. Create query runner
  const queryRunner = this.dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    // 2. Check idempotency
    const check = await this.idempotencyService.checkIdempotency(
      idempotencyKey,
      'your-service',
      '/your/endpoint',
      dto,
    );

    if (check.exists && check.status === 'completed') {
      await queryRunner.release();
      return check.data;
    }

    if (check.exists && check.status === 'pending') {
      await queryRunner.release();
      throw new RpcException('Request already in progress');
    }

    // 3. Lock the row(s) you need to modify
    const entity = await queryRunner.manager.findOne(YourEntity, {
      where: { id: dto.id },
      lock: { mode: 'pessimistic_write' },
    });

    if (!entity) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      throw new RpcException('Entity not found');
    }

    // 4. Validate business rules
    if (!isValid(entity)) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      throw new RpcException('Validation failed');
    }

    // 5. Perform modifications
    entity.someField = dto.someValue;
    entity.updatedAt = new Date();
    const result = await queryRunner.manager.save(YourEntity, entity);

    // 6. Mark completed
    await this.idempotencyService.markCompleted(
      idempotencyKey,
      'your-service',
      '/your/endpoint',
      dto,
      result,
      200,
    );

    // 7. Commit and return
    await queryRunner.commitTransaction();
    await queryRunner.release();
    return result;

  } catch (error) {
    await queryRunner.rollbackTransaction();
    await queryRunner.release();

    await this.idempotencyService.markFailed(
      idempotencyKey,
      'your-service',
      '/your/endpoint',
      error.message,
    );

    throw error;
  }
}
```

---

## 📝 Methods That Need This Pattern

### **Inventory Service:**

- ✅ `reduceStock()` - Already implemented
- 🔲 `reserveStock()` - Reserve stock for pending orders
- 🔲 `releaseStock()` - Release reserved stock (cancelled orders)
- 🔲 `addStock()` - Add stock (inventory replenishment)
- 🔲 `updateInventory()` - Update inventory details

### **Order Service:**

- 🔲 `updateOrderStatus()` - Already has idempotency, add row locking
- 🔲 `cancelOrder()` - Already has idempotency, add row locking

### **Payment Service:**

- 🔲 `processRefund()` - If you add refund functionality

---

## 🔑 Key Differences Between Methods

### **Simple Idempotency Only** (Order Service pattern)

- No row locking
- No transactions
- Good for: Operations where duplicate prevention is main concern
- Example: Order creation (each order has unique ID)

### **Idempotency + Row Locking** (Inventory Service pattern)

- Row locking with transactions
- Good for: Operations that modify shared resources
- Example: Stock reduction (multiple users buying same product)

---

## 🚨 When to Use Each Approach

| Scenario                                   | Use Simple Idempotency | Use Idempotency + Row Lock |
| ------------------------------------------ | ---------------------- | -------------------------- |
| Creating unique resources (orders, users)  | ✅                     | ❌                         |
| Updating shared resources (stock, balance) | ❌                     | ✅                         |
| High concurrency operations                | ❌                     | ✅                         |
| Financial transactions                     | ❌                     | ✅                         |
| Status updates (low contention)            | ✅                     | ❌                         |
| Cancellations (reversible)                 | ✅                     | ⚠️ (depends)               |

---

## 🎓 Controller Updates

Don't forget to update your controllers to accept idempotencyKey:

```typescript
@MessagePattern({ cmd: 'your_command' })
yourMethod(@Payload() data: { dto: YourDto; idempotencyKey: string }) {
  return this.yourService.yourMethod(data.dto, data.idempotencyKey);
}
```

---

## 💡 Pro Tips

1. **Always release connections:**
   - Even in catch blocks
   - Prevents connection pool exhaustion

2. **Rollback before release:**
   - Ensures changes are undone
   - Releases locks

3. **Lock only what you need:**
   - Don't lock entire tables
   - Lock specific rows with `where` clause

4. **Use appropriate lock mode:**
   - `pessimistic_read` for read-heavy operations
   - `pessimistic_write` for critical updates

5. **Keep transactions short:**
   - Don't do external API calls inside transactions
   - Don't wait for user input
   - Process fast, commit fast

6. **Test concurrency:**
   - Send multiple requests simultaneously
   - Verify correct results
   - Check for deadlocks

---

## 🧪 Testing Your Implementation

```bash
# Test concurrent stock reduction
for i in {1..10}; do
  curl -X POST http://localhost:3000/inventory/reduce-stock \
    -H "Content-Type: application/json" \
    -H "X-Idempotency-Key: test-$i" \
    -d '{"productId": "prod-123", "quantity": 1}' &
done
wait

# Expected result:
# - 10 requests sent
# - All succeed or fail correctly
# - Stock reduced by exactly 10 (if enough stock available)
# - No race conditions
```

---

## 📊 What Makes This Production-Ready

✅ **Idempotency** - Prevents duplicate operations  
✅ **Row Locking** - Prevents race conditions  
✅ **Transactions** - Ensures atomicity  
✅ **Error Handling** - Proper rollback and cleanup  
✅ **Logging** - Traceability  
✅ **Type Safety** - TypeScript validation  
✅ **Common Library** - DRY principle

---

## 🎯 Summary

**What you got:**

- ✅ Full `reduceStock` implementation with idempotency + row locking
- ✅ Uses same `IdempotencyModule` from common library
- ✅ Production-ready error handling
- ✅ Transaction management
- ✅ Updated controller to accept idempotencyKey

**What you need to do:**

1. Apply this pattern to `reserveStock()`
2. Apply this pattern to `releaseStock()`
3. Apply this pattern to `addStock()`
4. Test with concurrent requests
5. Monitor performance and adjust timeouts if needed

**Key takeaway:**

- Simple operations (create) → Idempotency only
- Shared resources (stock) → Idempotency + Row Locking
- Always use the same IdempotencyModule from common library
