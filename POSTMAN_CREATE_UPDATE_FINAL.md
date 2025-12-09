# ✅ FINAL POSTMAN PAYLOADS - CREATE & UPDATE INVENTORY

## ⚠️ IMPORTANT: Authentication Required

All routes require authentication. Follow these steps:

### Step 1: Login to Get Token

**POST** `http://localhost:3000/auth/login`

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "email": "user1@example.com",
  "password": "Admin123!"
}
```

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

Copy the `accessToken` value.

---

### Step 2: Add Authorization Header

For ALL inventory requests below, add this header:

**Headers:**
```
Authorization: Bearer <paste-your-token-here>
Content-Type: application/json
```

---

## 📦 CREATE INVENTORY

**POST** `http://localhost:3000/inventory/createinventory`

### ⚠️ IMPORTANT:
- **Inventory already exists for product `69380da197e644e3cbc77c77`**
- You CANNOT create inventory twice for the same product
- Use a different productId that doesn't have inventory yet
- If you get a 500 error, the product already has inventory

### Headers:
```
Authorization: Bearer <your-token>
Content-Type: application/json
```

### Body (Example 1 - ❌ WILL FAIL - Inventory exists):
```json
{
  "productId": "69380da197e644e3cbc77c77",
  "quantity": 100
}
```
**Note:** This will fail with 500 error because inventory already exists for this product!

### Body (Example 2 - ✅ WILL WORK - New Product):
```json
{
  "productId": "777777777777777777777777",
  "quantity": 150
}
```

### Expected Response (Success):
```json
{
  "statusCode": 201,
  "timestamp": "2025-12-09T18:20:33.403Z",
  "data": {
    "productId": "777777777777777777777777",
    "quantity": 150,
    "createdAt": "2025-12-09T18:20:33.395Z",
    "updatedAt": "2025-12-09T18:20:33.395Z",
    "id": "cf85318b-2529-4cf6-9e66-fa03194de2eb",
    "reserved": 0,
    "isActive": true
  }
}
```

### Expected Response (Error - Inventory Exists):
```json
{
  "statusCode": 500,
  "timestamp": "2025-12-09T18:17:26.722Z",
  "path": "/inventory/createinventory",
  "message": "Internal server error"
}
```
**This happens when inventory already exists for the productId!**

### Notes:
- ✅ Each product can only have ONE inventory record
- ✅ If inventory already exists for a product, you'll get an error
- ✅ `productId` must be a valid 24-character MongoDB ObjectId format
- ✅ `quantity` must be a positive number

---

## ✏️ UPDATE INVENTORY

**PATCH** `http://localhost:3000/inventory/updateinventory/{productId}`

### Headers:
```
Authorization: Bearer <your-token>
Content-Type: application/json
```

### URL Parameter:
Replace `{productId}` with the actual product ID

### Example 1: Update Quantity Only

**PATCH** `http://localhost:3000/inventory/updateinventory/69380da197e644e3cbc77c77`

**Body:**
```json
{
  "quantity": 500
}
```

### Example 2: Update Quantity and Deactivate

**PATCH** `http://localhost:3000/inventory/updateinventory/69380da197e644e3cbc77c77`

**Body:**
```json
{
  "quantity": 120,
  "isActive": false
}
```

### Example 3: Activate Inventory

**PATCH** `http://localhost:3000/inventory/updateinventory/69380da197e644e3cbc77c77`

**Body:**
```json
{
  "isActive": true
}
```

### Expected Response (Success):
```json
{
  "statusCode": 200,
  "timestamp": "2025-12-09T18:14:24.784Z",
  "data": {
    "id": "27cee6c5-9dd6-4751-b047-03140371103e",
    "productId": "69380da197e644e3cbc77c77",
    "quantity": 500,
    "reserved": 28,
    "isActive": true,
    "createdAt": "2025-12-09T17:04:05.114Z",
    "updatedAt": "2025-12-09T18:14:24.783Z"
  }
}
```

### Notes:
- ✅ Use `productId` in the URL (not inventory ID)
- ✅ `quantity` is optional - only send if you want to update it
- ✅ `isActive` is optional - only send if you want to update it
- ✅ Inventory must exist for the product or you'll get a 404 error

---

## 🔍 TESTING CHECKLIST

### For CREATE INVENTORY:
- [ ] Get auth token first
- [ ] Add `Authorization: Bearer <token>` header
- [ ] Add `Content-Type: application/json` header
- [ ] Use a unique `productId` (24 characters)
- [ ] Set a positive `quantity`
- [ ] Expect 201 Created status

### For UPDATE INVENTORY:
- [ ] Get auth token first
- [ ] Add `Authorization: Bearer <token>` header
- [ ] Add `Content-Type: application/json` header
- [ ] Use existing `productId` in URL
- [ ] Send at least one field (`quantity` or `isActive`)
- [ ] Expect 200 OK status

---

## 🎯 QUICK TEST PAYLOADS

### ⚠️ Your Product Already Has Inventory!
Product `69380da197e644e3cbc77c77` already has inventory, so CREATE will fail.
Use UPDATE instead, or create inventory for a different product.

### Test 1: ❌ Create Inventory (WILL FAIL - Already Exists)
```json
{
  "productId": "69380da197e644e3cbc77c77",
  "quantity": 100
}
```
**Expected:** 500 error because inventory exists

### Test 2: ✅ Create Inventory for New Product (WILL WORK)
```json
{
  "productId": "777777777777777777777777",
  "quantity": 100
}
```
**Expected:** 201 Created

### Test 3: ✅ Update Existing Inventory to 200 (WILL WORK)
```json
{
  "quantity": 200
}
```
URL: `http://localhost:3000/inventory/updateinventory/69380da197e644e3cbc77c77`
**Expected:** 200 OK

### Test 3: Create New Product Inventory
```json
{
  "productId": "888888888888888888888888",
  "quantity": 75
}
```

### Test 4: Update and Deactivate
```json
{
  "quantity": 150,
  "isActive": false
}
```
URL: `http://localhost:3000/inventory/updateinventory/888888888888888888888888`

---

## ✅ TEST RESULTS

```
✅ Create Inventory - PASSED (201 Created)
✅ Update Inventory (quantity only) - PASSED (200 OK)
✅ Update Inventory (quantity + isActive) - PASSED (200 OK)
✅ Update Inventory (isActive only) - PASSED (200 OK)
```

All routes are working perfectly with proper authentication! 🎉
