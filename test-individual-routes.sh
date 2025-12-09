#!/bin/bash

echo "=== Getting Admin Token ==="
TOKEN=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "testadmin3@test.com", "password": "Admin123!@#"}' | jq -r '.data.accessToken')

if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
  echo "Creating new admin user..."
  TOKEN=$(curl -s -X POST http://localhost:3000/auth/signup \
    -H "Content-Type: application/json" \
    -d '{"username": "producttest", "email": "producttest@test.com", "password": "Test123!@#", "role": "ADMIN"}' | jq -r '.data.accessToken')
fi

echo "Token obtained: ${TOKEN:0:30}..."
echo ""

# Test 1: Create unique category
TIMESTAMP=$(date +%s)
echo "=== TEST 1: Create Category ==="
CATEGORY_RESPONSE=$(curl -s -X POST http://localhost:3000/product/createcategory \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"name\": \"TestCat${TIMESTAMP}\", \"description\": \"Test category\"}")
echo "$CATEGORY_RESPONSE" | jq .
CATEGORY_ID=$(echo "$CATEGORY_RESPONSE" | jq -r '.data._id // empty')
echo "Category ID: $CATEGORY_ID"
echo ""

# Test 2: Get Category by ID
if [ ! -z "$CATEGORY_ID" ]; then
  echo "=== TEST 2: Get Category by ID ==="
  curl -s -X GET "http://localhost:3000/product/getcategory/$CATEGORY_ID" \
    -H "Authorization: Bearer $TOKEN" | jq .
  echo ""
fi

# Test 3: Create Product
if [ ! -z "$CATEGORY_ID" ]; then
  echo "=== TEST 3: Create Product ==="
  PRODUCT_RESPONSE=$(curl -s -X POST http://localhost:3000/product/createproduct \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "{\"name\": \"TestProduct${TIMESTAMP}\", \"description\": \"Test product\", \"price\": 99.99, \"categoryIds\": [\"$CATEGORY_ID\"], \"stock\": 50}")
  echo "$PRODUCT_RESPONSE" | jq .
  PRODUCT_ID=$(echo "$PRODUCT_RESPONSE" | jq -r '.data._id // empty')
  echo "Product ID: $PRODUCT_ID"
  echo ""
fi

# Test 4: Get Product by ID
if [ ! -z "$PRODUCT_ID" ]; then
  echo "=== TEST 4: Get Product by ID ==="
  curl -s -X GET "http://localhost:3000/product/getproduct/$PRODUCT_ID" \
    -H "Authorization: Bearer $TOKEN" | jq .
  echo ""
fi

# Test 5: Get Product by Slug
if [ ! -z "$PRODUCT_ID" ]; then
  echo "=== TEST 5: Get Product by Slug ==="
  SLUG="testproduct${TIMESTAMP}"
  curl -s -X GET "http://localhost:3000/product/getproductsbyslug/$SLUG" \
    -H "Authorization: Bearer $TOKEN" | jq .
  echo ""
fi

# Test 6: Update Product
if [ ! -z "$PRODUCT_ID" ]; then
  echo "=== TEST 6: Update Product ==="
  curl -s -X PATCH http://localhost:3000/product/updateproduct \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "{\"id\": \"$PRODUCT_ID\", \"price\": 79.99, \"stock\": 75}" | jq .
  echo ""
fi

# Test 7: Verify Update
if [ ! -z "$PRODUCT_ID" ]; then
  echo "=== TEST 7: Verify Product Update ==="
  curl -s -X GET "http://localhost:3000/product/getproduct/$PRODUCT_ID" \
    -H "Authorization: Bearer $TOKEN" | jq .
  echo ""
fi

# Test 8: Update Category
if [ ! -z "$CATEGORY_ID" ]; then
  echo "=== TEST 8: Update Category ==="
  curl -s -X PATCH "http://localhost:3000/product/updatecategory/$CATEGORY_ID" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{"description": "Updated description"}' | jq .
  echo ""
fi

# Test 9: Delete Product
if [ ! -z "$PRODUCT_ID" ]; then
  echo "=== TEST 9: Delete Product ==="
  curl -s -X DELETE "http://localhost:3000/product/deleteproduct/$PRODUCT_ID" \
    -H "Authorization: Bearer $TOKEN" | jq .
  echo ""
fi

# Test 10: Verify Delete
if [ ! -z "$PRODUCT_ID" ]; then
  echo "=== TEST 10: Verify Product Deleted ==="
  curl -s -X GET "http://localhost:3000/product/getproduct/$PRODUCT_ID" \
    -H "Authorization: Bearer $TOKEN" | jq .
  echo ""
fi

# Test 11: Delete Category
if [ ! -z "$CATEGORY_ID" ]; then
  echo "=== TEST 11: Delete Category ==="
  curl -s -X DELETE "http://localhost:3000/product/deletecategory/$CATEGORY_ID" \
    -H "Authorization: Bearer $TOKEN" | jq .
  echo ""
fi

echo "=== All individual route tests completed ==="
