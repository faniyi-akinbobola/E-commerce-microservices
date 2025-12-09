# Product API Testing Guide

## Base URL

```
http://localhost:3000
```

## Authentication

Most routes require JWT authentication. Add this header:

```
Authorization: Bearer <your_jwt_token>
```

For admin-only routes, ensure your token contains a user with admin role.

---

## 1. Category Routes

### Create Category (Admin Only)

**Endpoint:** `POST /product/createcategory`

**Headers:**

```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer <admin_token>"
}
```

**Body:**

```json
{
  "name": "Electronics",
  "description": "Electronic devices and accessories"
}
```

**Alternative Examples:**

```json
{
  "name": "Clothing",
  "description": "Men's and Women's clothing"
}
```

```json
{
  "name": "Home & Kitchen",
  "description": "Home appliances and kitchen essentials"
}
```

---

### Get All Categories (Public)

**Endpoint:** `GET /product/getcategories`

**Headers:**

```json
{
  "Authorization": "Bearer <token>"
}
```

**No body required**

---

### Get Category by ID (Public)

**Endpoint:** `GET /product/getcategory/:id`

**Headers:**

```json
{
  "Authorization": "Bearer <token>"
}
```

**Example:**

```
GET /product/getcategory/656e2b8f8f1b2c0012345678
```

**No body required**

---

### Get Category by Slug (Public)

**Endpoint:** `GET /product/getcategoriesbyslug/:slug`

**Headers:**

```json
{
  "Authorization": "Bearer <token>"
}
```

**Example:**

```
GET /product/getcategoriesbyslug/electronics
```

**No body required**

---

### Update Category (Admin Only)

**Endpoint:** `PATCH /product/updatecategory/:id`

**Headers:**

```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer <admin_token>"
}
```

**Example:**

```
PATCH /product/updatecategory/656e2b8f8f1b2c0012345678
```

**Body:**

```json
{
  "name": "Electronics & Gadgets",
  "description": "All electronic devices, gadgets and accessories"
}
```

---

### Delete Category (Admin Only)

**Endpoint:** `DELETE /product/deletecategory/:id`

**Headers:**

```json
{
  "Authorization": "Bearer <admin_token>"
}
```

**Example:**

```
DELETE /product/deletecategory/656e2b8f8f1b2c0012345678
```

**No body required**

---

## 2. Product Routes

### Create Product (Admin Only)

**Endpoint:** `POST /product/createproduct`

**Headers:**

```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer <admin_token>"
}
```

**Body:**

```json
{
  "name": "Wireless Mouse",
  "description": "Ergonomic wireless mouse with USB receiver",
  "price": 29.99,
  "categoryId": "656e2b8f8f1b2c0012345678",
  "stock": 100,
  "images": ["https://example.com/mouse.jpg", "https://example.com/mouse-2.jpg"]
}
```

**Alternative Examples:**

```json
{
  "name": "Mechanical Keyboard RGB",
  "description": "Gaming keyboard with RGB backlight and mechanical switches",
  "price": 89.99,
  "categoryId": "656e2b8f8f1b2c0012345678",
  "stock": 50,
  "images": ["https://example.com/keyboard.jpg"]
}
```

```json
{
  "name": "USB-C Hub 7-in-1",
  "description": "7-in-1 USB-C hub with HDMI, USB 3.0, SD card reader",
  "price": 45.99,
  "categoryId": "656e2b8f8f1b2c0012345678",
  "stock": 75,
  "images": ["https://example.com/usb-hub.jpg"]
}
```

---

### Get All Products (Public)

**Endpoint:** `GET /product/getproducts`

**Headers:**

```json
{
  "Authorization": "Bearer <token>"
}
```

**No body required**

---

### Get Product by ID (Public)

**Endpoint:** `GET /product/getproduct/:id`

**Headers:**

```json
{
  "Authorization": "Bearer <token>"
}
```

**Example:**

```
GET /product/getproduct/656e2b8f8f1b2c0012345679
```

**No body required**

---

### Get Product by Slug (Public)

**Endpoint:** `GET /product/getproductsbyslug/:slug`

**Headers:**

```json
{
  "Authorization": "Bearer <token>"
}
```

**Example:**

```
GET /product/getproductsbyslug/wireless-mouse
```

**No body required**

---

### Get Available Products (Public)

**Endpoint:** `GET /product/getavailableproducts`

**Headers:**

```json
{
  "Authorization": "Bearer <token>"
}
```

**Description:** Returns only products with stock > 0

**No body required**

---

### Get Products by Category Slug (Public)

**Endpoint:** `GET /product/getproductsbycategory/:slug`

**Headers:**

```json
{
  "Authorization": "Bearer <token>"
}
```

**Example:**

```
GET /product/getproductsbycategory/electronics
```

**No body required**

---

### Update Product (Admin Only)

**Endpoint:** `PATCH /product/updateproduct`

**Headers:**

```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer <admin_token>"
}
```

**Body:**

```json
{
  "id": "656e2b8f8f1b2c0012345679",
  "name": "Wireless Mouse Pro",
  "description": "Upgraded ergonomic wireless mouse with longer battery life",
  "price": 39.99,
  "categoryId": "656e2b8f8f1b2c0012345678",
  "stock": 80,
  "images": ["https://example.com/mouse-pro.jpg"]
}
```

**Partial Update Example:**

```json
{
  "id": "656e2b8f8f1b2c0012345679",
  "price": 34.99,
  "stock": 120
}
```

---

### Delete Product (Admin Only)

**Endpoint:** `DELETE /product/deleteproduct/:id`

**Headers:**

```json
{
  "Authorization": "Bearer <admin_token>"
}
```

**Example:**

```
DELETE /product/deleteproduct/656e2b8f8f1b2c0012345679
```

**No body required**

---

## Testing Workflow

### Step 1: Create a Category First

```bash
# Create Electronics category
POST /product/createcategory
{
  "name": "Electronics",
  "description": "Electronic devices and accessories"
}

# Save the returned category ID (e.g., "656e2b8f8f1b2c0012345678")
```

### Step 2: Create Products Using Category ID

```bash
# Create a product
POST /product/createproduct
{
  "name": "Wireless Mouse",
  "description": "Ergonomic wireless mouse",
  "price": 29.99,
  "categoryId": "656e2b8f8f1b2c0012345678",  # Use the ID from Step 1
  "stock": 100,
  "images": ["https://example.com/mouse.jpg"]
}
```

### Step 3: Test Retrieval Endpoints

```bash
# Get all products
GET /product/getproducts

# Get all categories
GET /product/getcategories

# Get products by category
GET /product/getproductsbycategory/electronics
```

### Step 4: Test Update

```bash
# Update product
PATCH /product/updateproduct
{
  "id": "<product_id>",
  "price": 24.99,
  "stock": 150
}
```

### Step 5: Test Delete

```bash
# Delete product
DELETE /product/deleteproduct/<product_id>

# Delete category
DELETE /product/deletecategory/<category_id>
```

---

## Common Error Responses

### 400 Bad Request

```json
{
  "statusCode": 400,
  "message": "Category not found",
  "error": "Bad Request"
}
```

### 401 Unauthorized

```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### 403 Forbidden (Missing Admin Role)

```json
{
  "statusCode": 403,
  "message": "Forbidden resource",
  "error": "Forbidden"
}
```

### 404 Not Found

```json
{
  "statusCode": 404,
  "message": "Product not found",
  "error": "Not Found"
}
```

---

## Notes

1. **MongoDB ObjectID Format:** Category IDs and Product IDs use MongoDB's ObjectID format (24 hex characters)
2. **Authentication:** Admin routes require a JWT token with admin role
3. **Slugs:** Automatically generated from names (e.g., "Wireless Mouse" → "wireless-mouse")
4. **Images:** Array of image URLs (can be empty array)
5. **Stock:** Products with stock = 0 won't appear in `/getavailableproducts`
6. **Timeout:** Requests timeout after 5 seconds (TimeoutInterceptor is enabled)

---

## Postman Collection Tips

1. Create an environment variable for `baseUrl` = `http://localhost:3000`
2. Create an environment variable for `token` to store your JWT
3. Create an environment variable for `categoryId` after creating a category
4. Use `{{baseUrl}}/product/createproduct` in your requests
5. Set Authorization header as `Bearer {{token}}`
