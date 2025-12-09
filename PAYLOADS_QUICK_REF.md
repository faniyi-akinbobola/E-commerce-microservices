# 🎯 Product API - Quick Test Payloads

## Base URL: http://localhost:3000

---

## 1️⃣ CREATE CATEGORY (Admin)

```
POST /product/createcategory
```

```json
{
  "name": "Electronics",
  "description": "Electronic devices and accessories"
}
```

---

## 2️⃣ CREATE PRODUCT (Admin)

```
POST /product/createproduct
```

```json
{
  "name": "Wireless Mouse",
  "description": "Ergonomic wireless mouse with USB receiver",
  "price": 29.99,
  "categoryId": "PASTE_CATEGORY_ID_HERE",
  "stock": 100,
  "images": ["https://example.com/mouse.jpg"]
}
```

---

## 3️⃣ GET ALL PRODUCTS

```
GET /product/getproducts
```

No body needed

---

## 4️⃣ GET ALL CATEGORIES

```
GET /product/getcategories
```

No body needed

---

## 5️⃣ GET PRODUCTS BY CATEGORY

```
GET /product/getproductsbycategory/electronics
```

No body needed

---

## 6️⃣ UPDATE PRODUCT (Admin)

```
PATCH /product/updateproduct
```

```json
{
  "id": "PASTE_PRODUCT_ID_HERE",
  "price": 24.99,
  "stock": 150
}
```

---

## 7️⃣ UPDATE CATEGORY (Admin)

```
PATCH /product/updatecategory/PASTE_CATEGORY_ID_HERE
```

```json
{
  "name": "Electronics & Gadgets",
  "description": "Updated description"
}
```

---

## 8️⃣ DELETE PRODUCT (Admin)

```
DELETE /product/deleteproduct/PASTE_PRODUCT_ID_HERE
```

No body needed

---

## 9️⃣ DELETE CATEGORY (Admin)

```
DELETE /product/deletecategory/PASTE_CATEGORY_ID_HERE
```

No body needed

---

## 📋 Headers Required

### For Admin Routes (Create/Update/Delete)

```
Content-Type: application/json
Authorization: Bearer YOUR_ADMIN_TOKEN
```

### For Public Routes (Get)

```
Authorization: Bearer YOUR_TOKEN
```

---

## 🔍 View Logs in Terminal

```bash
# Open VS Code Terminal: Ctrl + `

# View API Gateway logs
docker logs -f ecommerce-api-gateway-1

# View Product Service logs
docker logs -f ecommerce-product-service-1

# Stop following: Ctrl+C
```

---

## ✅ Test Order

1. Create Category → Save the `_id`
2. Create Product → Use category `_id` as `categoryId`
3. Get All Products → Verify product appears
4. Update Product → Test price/stock changes
5. Delete Product → Cleanup

---

## 📚 Full Documentation

- `PRODUCT_API_TESTING.md` - Complete API docs
- `QUICK_START_TESTING.md` - Step-by-step guide
- `DOCKER_LOGS_GUIDE.md` - How to view logs
