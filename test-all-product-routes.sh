#!/bin/bash

# Get fresh token
echo "Getting admin token..."
TOKEN=$(curl -s -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d "{
    \"username\": \"testadmin$(date +%s)\",
    \"email\": \"testadmin$(date +%s)@test.com\",
    \"password\": \"Admin123!@#\",
    \"role\": \"ADMIN\"
  }" | jq -r '.data.accessToken')

echo "Token: ${TOKEN:0:50}..."
echo ""

# Test 1: Create Category
echo "=== TEST 1: Create Category (Electronics) ==="
CATEGORY_RESPONSE=$(curl -s -X POST http://localhost:3000/product/createcategory \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Electronics",
    "description": "Electronic devices and accessories"
  }')
echo "$CATEGORY_RESPONSE" | jq .
CATEGORY_ID=$(echo "$CATEGORY_RESPONSE" | jq -r '.data._id')
echo "Category ID: $CATEGORY_ID"
echo ""

# Test 2: Get All Categories
echo "=== TEST 2: Get All Categories ==="
curl -s -X GET http://localhost:3000/product/getcategories \
  -H "Authorization: Bearer $TOKEN" | jq .
echo ""

# Test 3: Get Category by ID
echo "=== TEST 3: Get Category by ID ==="
curl -s -X GET "http://localhost:3000/product/getcategory/$CATEGORY_ID" \
  -H "Authorization: Bearer $TOKEN" | jq .
echo ""

# Test 4: Get Category by Slug
echo "=== TEST 4: Get Category by Slug (electronics) ==="
curl -s -X GET "http://localhost:3000/product/getcategoriesbyslug/electronics" \
  -H "Authorization: Bearer $TOKEN" | jq .
echo ""

# Test 5: Create Product
echo "=== TEST 5: Create Product (Wireless Mouse) ==="
PRODUCT_RESPONSE=$(curl -s -X POST http://localhost:3000/product/createproduct \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"name\": \"Wireless Mouse\",
    \"description\": \"Ergonomic wireless mouse with USB receiver\",
    \"price\": 29.99,
    \"categoryIds\": [\"$CATEGORY_ID\"],
    \"stock\": 100,
    \"images\": [\"https://example.com/mouse.jpg\"]
  }")
echo "$PRODUCT_RESPONSE" | jq .
PRODUCT_ID=$(echo "$PRODUCT_RESPONSE" | jq -r '.data._id')
echo "Product ID: $PRODUCT_ID"
echo ""

# Test 6: Create Another Product
echo "=== TEST 6: Create Product (Mechanical Keyboard) ==="
curl -s -X POST http://localhost:3000/product/createproduct \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"name\": \"Mechanical Keyboard RGB\",
    \"description\": \"Gaming keyboard with RGB backlight\",
    \"price\": 89.99,
    \"categoryIds\": [\"$CATEGORY_ID\"],
    \"stock\": 50,
    \"images\": [\"https://example.com/keyboard.jpg\"]
  }" | jq .
echo ""

# Test 7: Get All Products
echo "=== TEST 7: Get All Products ==="
curl -s -X GET http://localhost:3000/product/getproducts \
  -H "Authorization: Bearer $TOKEN" | jq .
echo ""

# Test 8: Get Product by ID
echo "=== TEST 8: Get Product by ID ==="
curl -s -X GET "http://localhost:3000/product/getproduct/$PRODUCT_ID" \
  -H "Authorization: Bearer $TOKEN" | jq .
echo ""

# Test 9: Get Product by Slug
echo "=== TEST 9: Get Product by Slug (wireless-mouse) ==="
curl -s -X GET "http://localhost:3000/product/getproductsbyslug/wireless-mouse" \
  -H "Authorization: Bearer $TOKEN" | jq .
echo ""

# Test 10: Get Available Products
echo "=== TEST 10: Get Available Products ==="
curl -s -X GET "http://localhost:3000/product/getavailableproducts" \
  -H "Authorization: Bearer $TOKEN" | jq .
echo ""

# Test 11: Get Products by Category
echo "=== TEST 11: Get Products by Category (electronics) ==="
curl -s -X GET "http://localhost:3000/product/getproductsbycategory/electronics" \
  -H "Authorization: Bearer $TOKEN" | jq .
echo ""

# Test 12: Update Product
echo "=== TEST 12: Update Product (change price and stock) ==="
curl -s -X PATCH http://localhost:3000/product/updateproduct \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"id\": \"$PRODUCT_ID\",
    \"price\": 24.99,
    \"stock\": 150
  }" | jq .
echo ""

# Test 13: Verify Update
echo "=== TEST 13: Verify Product Update ==="
curl -s -X GET "http://localhost:3000/product/getproduct/$PRODUCT_ID" \
  -H "Authorization: Bearer $TOKEN" | jq .
echo ""

# Test 14: Update Category
echo "=== TEST 14: Update Category ==="
curl -s -X PATCH "http://localhost:3000/product/updatecategory/$CATEGORY_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Electronics & Gadgets",
    "description": "All electronic devices and gadgets"
  }' | jq .
echo ""

# Test 15: Delete Product
echo "=== TEST 15: Delete Product ==="
curl -s -X DELETE "http://localhost:3000/product/deleteproduct/$PRODUCT_ID" \
  -H "Authorization: Bearer $TOKEN" | jq .
echo ""

# Test 16: Verify Product Deleted
echo "=== TEST 16: Verify Product Deleted ==="
curl -s -X GET "http://localhost:3000/product/getproduct/$PRODUCT_ID" \
  -H "Authorization: Bearer $TOKEN" | jq .
echo ""

# Test 17: Delete Category
echo "=== TEST 17: Delete Category ==="
curl -s -X DELETE "http://localhost:3000/product/deletecategory/$CATEGORY_ID" \
  -H "Authorization: Bearer $TOKEN" | jq .
echo ""

echo "✅ All tests completed!"
