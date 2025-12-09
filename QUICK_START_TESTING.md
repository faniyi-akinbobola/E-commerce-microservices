# Quick Start: Testing Product API

## 🚀 Quick Test Commands

### Prerequisites

1. All services must be running: `docker ps`
2. You need an admin JWT token (get from login/register)

---

## 📋 Testing in Postman

### 1️⃣ First, Create a Category

**Request:**

```
POST http://localhost:3000/product/createcategory
```

**Headers:**

```
Content-Type: application/json
Authorization: Bearer YOUR_ADMIN_TOKEN_HERE
```

**Body (raw JSON):**

```json
{
  "name": "Electronics",
  "description": "Electronic devices and accessories"
}
```

**Expected Response:**

```json
{
  "_id": "656e2b8f8f1b2c0012345678",
  "name": "Electronics",
  "description": "Electronic devices and accessories",
  "slug": "electronics",
  "createdAt": "2025-12-09T11:30:00.000Z",
  "updatedAt": "2025-12-09T11:30:00.000Z"
}
```

**⚠️ SAVE THE `_id` - you'll need it for creating products!**

---

### 2️⃣ Create a Product

**Request:**

```
POST http://localhost:3000/product/createproduct
```

**Headers:**

```
Content-Type: application/json
Authorization: Bearer YOUR_ADMIN_TOKEN_HERE
```

**Body (raw JSON):**

```json
{
  "name": "Wireless Mouse",
  "description": "Ergonomic wireless mouse with USB receiver",
  "price": 29.99,
  "categoryId": "656e2b8f8f1b2c0012345678",
  "stock": 100,
  "images": ["https://example.com/mouse.jpg"]
}
```

**Replace `categoryId` with the `_id` from step 1!**

**Expected Response:**

```json
{
  "_id": "656e2b8f8f1b2c0012345679",
  "name": "Wireless Mouse",
  "description": "Ergonomic wireless mouse with USB receiver",
  "price": 29.99,
  "categoryId": "656e2b8f8f1b2c0012345678",
  "slug": "wireless-mouse",
  "stock": 100,
  "images": ["https://example.com/mouse.jpg"],
  "createdAt": "2025-12-09T11:30:00.000Z",
  "updatedAt": "2025-12-09T11:30:00.000Z"
}
```

---

### 3️⃣ Get All Products

**Request:**

```
GET http://localhost:3000/product/getproducts
```

**Headers:**

```
Authorization: Bearer YOUR_TOKEN_HERE
```

**No body needed**

---

### 4️⃣ Get Products by Category

**Request:**

```
GET http://localhost:3000/product/getproductsbycategory/electronics
```

**Headers:**

```
Authorization: Bearer YOUR_TOKEN_HERE
```

**No body needed**

---

### 5️⃣ Update a Product

**Request:**

```
PATCH http://localhost:3000/product/updateproduct
```

**Headers:**

```
Content-Type: application/json
Authorization: Bearer YOUR_ADMIN_TOKEN_HERE
```

**Body (raw JSON):**

```json
{
  "id": "656e2b8f8f1b2c0012345679",
  "price": 24.99,
  "stock": 150
}
```

**Replace `id` with your product's `_id`!**

---

### 6️⃣ Delete a Product

**Request:**

```
DELETE http://localhost:3000/product/deleteproduct/656e2b8f8f1b2c0012345679
```

**Headers:**

```
Authorization: Bearer YOUR_ADMIN_TOKEN_HERE
```

**Replace the ID at the end of the URL!**

---

## 🔧 Testing with cURL

### Create Category

```bash
curl -X POST http://localhost:3000/product/createcategory \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "name": "Electronics",
    "description": "Electronic devices and accessories"
  }'
```

### Create Product

```bash
curl -X POST http://localhost:3000/product/createproduct \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "name": "Wireless Mouse",
    "description": "Ergonomic wireless mouse",
    "price": 29.99,
    "categoryId": "YOUR_CATEGORY_ID_HERE",
    "stock": 100,
    "images": ["https://example.com/mouse.jpg"]
  }'
```

### Get All Products

```bash
curl -X GET http://localhost:3000/product/getproducts \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## ❌ Common Errors & Solutions

### Error: "PRECONDITION_FAILED - inequivalent arg 'durable'"

**Solution:** ✅ FIXED! Queue configuration is now synchronized.

### Error: "Category not found"

**Problem:** Invalid `categoryId` in product creation
**Solution:**

1. First create a category
2. Copy the `_id` from the response
3. Use it as `categoryId` when creating products

### Error: "Unauthorized"

**Problem:** Missing or invalid JWT token
**Solution:**

1. Login or register to get a token
2. Add it to Authorization header: `Bearer YOUR_TOKEN`

### Error: "Forbidden resource"

**Problem:** Non-admin user trying to access admin routes
**Solution:** Use a token from a user with admin role

### Error: "Invalid MongoDB ObjectId"

**Problem:** Wrong ID format
**Solution:** Use the full 24-character hex ID from MongoDB (e.g., `656e2b8f8f1b2c0012345678`)

---

## 🎯 Test Checklist

- [ ] Create a category
- [ ] Get all categories
- [ ] Get category by ID
- [ ] Get category by slug
- [ ] Create a product (using category ID)
- [ ] Get all products
- [ ] Get product by ID
- [ ] Get product by slug
- [ ] Get products by category slug
- [ ] Get available products (stock > 0)
- [ ] Update a product
- [ ] Update a category
- [ ] Delete a product
- [ ] Delete a category

---

## 📊 View Logs While Testing

### In VS Code Terminal

Press `` Ctrl + ` `` and run:

```bash
# Monitor API Gateway
docker logs -f ecommerce-api-gateway-1

# Monitor Product Service (in a new terminal tab)
docker logs -f ecommerce-product-service-1
```

**To stop following logs:** Press `Ctrl+C`

---

## ✅ Verification

### Check Services are Running

```bash
docker ps
```

All these should show "Up":

- ecommerce-api-gateway-1
- ecommerce-product-service-1
- ecommerce-product-db-1
- ecommerce-rabbitmq-1

### Check API is Accessible

```bash
curl http://localhost:3000
```

### Check RabbitMQ Management UI

Open in browser: http://localhost:15672

- Username: `guest`
- Password: `guest`

---

## 🎓 Features Implemented

✅ **TimeoutInterceptor** - Requests timeout after 5 seconds (configurable via `TIMEOUT_MS` env var)
✅ **RabbitMQ Queue** - Product queue properly configured with `durable: true`
✅ **MongoDB** - Product and Category entities with proper schema
✅ **Slug Generation** - Automatic slug creation from names
✅ **Role-Based Access** - Admin-only routes for create/update/delete
✅ **Public Routes** - GET endpoints accessible to all authenticated users
✅ **Error Handling** - Comprehensive error responses

---

## 📚 Additional Documentation

- **Full API Documentation:** See `PRODUCT_API_TESTING.md`
- **Docker Logs Guide:** See `DOCKER_LOGS_GUIDE.md`

---

## 💡 Pro Tips

1. **Save Category ID:** After creating a category, save its ID in a Postman environment variable
2. **Use Collections:** Create a Postman collection with all these requests
3. **Environment Variables:** Set up `baseUrl`, `token`, and `categoryId` in Postman
4. **Test Order:** Always create categories before products
5. **Monitor Logs:** Keep a terminal open with `docker logs -f ecommerce-api-gateway-1`
