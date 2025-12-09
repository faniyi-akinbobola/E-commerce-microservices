#!/bin/bash

echo "=================================="
echo "  COMPREHENSIVE PRODUCT API TEST  "
echo "=================================="
echo ""

# Get admin token
echo "🔐 Getting Admin Token..."
TOKEN=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "testadmin3@test.com", "password": "Admin123!@#"}' | jq -r '.data.accessToken')

if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
  TOKEN=$(curl -s -X POST http://localhost:3000/auth/signup \
    -H "Content-Type: application/json" \
    -d '{"username": "finaltest", "email": "finaltest@test.com", "password": "Test123!@#", "role": "ADMIN"}' | jq -r '.data.accessToken')
fi

echo "✅ Token obtained"
echo ""

TIMESTAMP=$(date +%s)
PASS=0
TOTAL=0

# Test 1: Create Category
echo "📝 TEST 1: Create Category"
TOTAL=$((TOTAL + 1))
RESPONSE=$(curl -s -X POST http://localhost:3000/product/createcategory \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"name\": \"FinalCat${TIMESTAMP}\", \"description\": \"Final test category\"}")
STATUS=$(echo "$RESPONSE" | jq -r '.statusCode')
if [ "$STATUS" = "201" ]; then
  echo "✅ PASS - Category created"
  PASS=$((PASS + 1))
  CATEGORY_ID=$(echo "$RESPONSE" | jq -r '.data._id')
else
  echo "❌ FAIL - Status: $STATUS"
fi
echo ""

# Test 2: Get All Categories
echo "📝 TEST 2: Get All Categories"
TOTAL=$((TOTAL + 1))
RESPONSE=$(curl -s -X GET http://localhost:3000/product/getcategories \
  -H "Authorization: Bearer $TOKEN")
STATUS=$(echo "$RESPONSE" | jq -r '.statusCode')
if [ "$STATUS" = "200" ]; then
  COUNT=$(echo "$RESPONSE" | jq -r '.data | length')
  echo "✅ PASS - Found $COUNT categories"
  PASS=$((PASS + 1))
else
  echo "❌ FAIL - Status: $STATUS"
fi
echo ""

# Test 3: Get Category by ID
if [ ! -z "$CATEGORY_ID" ]; then
  echo "📝 TEST 3: Get Category by ID"
  TOTAL=$((TOTAL + 1))
  RESPONSE=$(curl -s -X GET "http://localhost:3000/product/getcategory/$CATEGORY_ID" \
    -H "Authorization: Bearer $TOKEN")
  STATUS=$(echo "$RESPONSE" | jq -r '.statusCode')
  if [ "$STATUS" = "200" ]; then
    echo "✅ PASS - Category retrieved"
    PASS=$((PASS + 1))
  else
    echo "❌ FAIL - Status: $STATUS"
  fi
  echo ""
fi

# Test 4: Get Category by Slug
if [ ! -z "$CATEGORY_ID" ]; then
  echo "📝 TEST 4: Get Category by Slug"
  TOTAL=$((TOTAL + 1))
  SLUG="finalcat${TIMESTAMP}"
  RESPONSE=$(curl -s -X GET "http://localhost:3000/product/getcategoriesbyslug/$SLUG" \
    -H "Authorization: Bearer $TOKEN")
  STATUS=$(echo "$RESPONSE" | jq -r '.statusCode')
  if [ "$STATUS" = "200" ]; then
    echo "✅ PASS - Category retrieved by slug"
    PASS=$((PASS + 1))
  else
    echo "❌ FAIL - Status: $STATUS"
  fi
  echo ""
fi

# Test 5: Update Category
if [ ! -z "$CATEGORY_ID" ]; then
  echo "📝 TEST 5: Update Category"
  TOTAL=$((TOTAL + 1))
  RESPONSE=$(curl -s -X PATCH "http://localhost:3000/product/updatecategory/$CATEGORY_ID" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{"description": "Updated final test category"}')
  STATUS=$(echo "$RESPONSE" | jq -r '.statusCode')
  if [ "$STATUS" = "200" ]; then
    echo "✅ PASS - Category updated"
    PASS=$((PASS + 1))
  else
    echo "❌ FAIL - Status: $STATUS"
  fi
  echo ""
fi

# Test 6: Create Product
if [ ! -z "$CATEGORY_ID" ]; then
  echo "📝 TEST 6: Create Product"
  TOTAL=$((TOTAL + 1))
  RESPONSE=$(curl -s -X POST http://localhost:3000/product/createproduct \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "{\"name\": \"FinalProduct${TIMESTAMP}\", \"description\": \"Final test product\", \"price\": 199.99, \"categoryIds\": [\"$CATEGORY_ID\"], \"stock\": 100, \"images\": [\"https://example.com/product.jpg\"]}")
  STATUS=$(echo "$RESPONSE" | jq -r '.statusCode')
  if [ "$STATUS" = "201" ]; then
    echo "✅ PASS - Product created"
    PASS=$((PASS + 1))
    PRODUCT_ID=$(echo "$RESPONSE" | jq -r '.data._id')
  else
    echo "❌ FAIL - Status: $STATUS"
  fi
  echo ""
fi

# Test 7: Get All Products
echo "📝 TEST 7: Get All Products"
TOTAL=$((TOTAL + 1))
RESPONSE=$(curl -s -X GET http://localhost:3000/product/getproducts \
  -H "Authorization: Bearer $TOKEN")
STATUS=$(echo "$RESPONSE" | jq -r '.statusCode')
if [ "$STATUS" = "200" ]; then
  COUNT=$(echo "$RESPONSE" | jq -r '.data | length')
  echo "✅ PASS - Found $COUNT products"
  PASS=$((PASS + 1))
else
  echo "❌ FAIL - Status: $STATUS"
fi
echo ""

# Test 8: Get Product by ID
if [ ! -z "$PRODUCT_ID" ]; then
  echo "📝 TEST 8: Get Product by ID"
  TOTAL=$((TOTAL + 1))
  RESPONSE=$(curl -s -X GET "http://localhost:3000/product/getproduct/$PRODUCT_ID" \
    -H "Authorization: Bearer $TOKEN")
  STATUS=$(echo "$RESPONSE" | jq -r '.statusCode')
  if [ "$STATUS" = "200" ]; then
    echo "✅ PASS - Product retrieved"
    PASS=$((PASS + 1))
  else
    echo "❌ FAIL - Status: $STATUS"
  fi
  echo ""
fi

# Test 9: Get Product by Slug
if [ ! -z "$PRODUCT_ID" ]; then
  echo "📝 TEST 9: Get Product by Slug"
  TOTAL=$((TOTAL + 1))
  SLUG="finalproduct${TIMESTAMP}"
  RESPONSE=$(curl -s -X GET "http://localhost:3000/product/getproductsbyslug/$SLUG" \
    -H "Authorization: Bearer $TOKEN")
  STATUS=$(echo "$RESPONSE" | jq -r '.statusCode')
  if [ "$STATUS" = "200" ]; then
    echo "✅ PASS - Product retrieved by slug"
    PASS=$((PASS + 1))
  else
    echo "❌ FAIL - Status: $STATUS"
  fi
  echo ""
fi

# Test 10: Get Available Products
echo "📝 TEST 10: Get Available Products (stock > 0)"
TOTAL=$((TOTAL + 1))
RESPONSE=$(curl -s -X GET http://localhost:3000/product/getavailableproducts \
  -H "Authorization: Bearer $TOKEN")
STATUS=$(echo "$RESPONSE" | jq -r '.statusCode')
if [ "$STATUS" = "200" ]; then
  COUNT=$(echo "$RESPONSE" | jq -r '.data | length')
  echo "✅ PASS - Found $COUNT available products"
  PASS=$((PASS + 1))
else
  echo "❌ FAIL - Status: $STATUS"
fi
echo ""

# Test 11: Get Products by Category
if [ ! -z "$CATEGORY_ID" ]; then
  echo "📝 TEST 11: Get Products by Category"
  TOTAL=$((TOTAL + 1))
  SLUG="finalcat${TIMESTAMP}"
  RESPONSE=$(curl -s -X GET "http://localhost:3000/product/getproductsbycategory/$SLUG" \
    -H "Authorization: Bearer $TOKEN")
  STATUS=$(echo "$RESPONSE" | jq -r '.statusCode')
  if [ "$STATUS" = "200" ]; then
    COUNT=$(echo "$RESPONSE" | jq -r '.data | length')
    echo "✅ PASS - Found $COUNT products in category"
    PASS=$((PASS + 1))
  else
    echo "❌ FAIL - Status: $STATUS"
  fi
  echo ""
fi

# Test 12: Update Product
if [ ! -z "$PRODUCT_ID" ]; then
  echo "📝 TEST 12: Update Product"
  TOTAL=$((TOTAL + 1))
  RESPONSE=$(curl -s -X PATCH http://localhost:3000/product/updateproduct \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "{\"id\": \"$PRODUCT_ID\", \"price\": 149.99, \"stock\": 75}")
  STATUS=$(echo "$RESPONSE" | jq -r '.statusCode')
  if [ "$STATUS" = "200" ]; then
    NEW_PRICE=$(echo "$RESPONSE" | jq -r '.data.price')
    NEW_STOCK=$(echo "$RESPONSE" | jq -r '.data.stock')
    echo "✅ PASS - Product updated (price: $NEW_PRICE, stock: $NEW_STOCK)"
    PASS=$((PASS + 1))
  else
    echo "❌ FAIL - Status: $STATUS"
  fi
  echo ""
fi

# Test 13: Delete Product
if [ ! -z "$PRODUCT_ID" ]; then
  echo "📝 TEST 13: Delete Product"
  TOTAL=$((TOTAL + 1))
  RESPONSE=$(curl -s -X DELETE "http://localhost:3000/product/deleteproduct/$PRODUCT_ID" \
    -H "Authorization: Bearer $TOKEN")
  STATUS=$(echo "$RESPONSE" | jq -r '.statusCode')
  if [ "$STATUS" = "200" ]; then
    echo "✅ PASS - Product deleted"
    PASS=$((PASS + 1))
  else
    echo "❌ FAIL - Status: $STATUS"
  fi
  echo ""
fi

# Test 14: Delete Category
if [ ! -z "$CATEGORY_ID" ]; then
  echo "📝 TEST 14: Delete Category"
  TOTAL=$((TOTAL + 1))
  RESPONSE=$(curl -s -X DELETE "http://localhost:3000/product/deletecategory/$CATEGORY_ID" \
    -H "Authorization: Bearer $TOKEN")
  STATUS=$(echo "$RESPONSE" | jq -r '.statusCode')
  if [ "$STATUS" = "200" ]; then
    echo "✅ PASS - Category deleted"
    PASS=$((PASS + 1))
  else
    echo "❌ FAIL - Status: $STATUS"
  fi
  echo ""
fi

echo "=================================="
echo "  TEST RESULTS"
echo "=================================="
echo "✅ Passed: $PASS / $TOTAL"
echo "❌ Failed: $((TOTAL - PASS)) / $TOTAL"
echo ""

if [ $PASS -eq $TOTAL ]; then
  echo "🎉 ALL TESTS PASSED! 🎉"
  echo "All product routes are working correctly!"
else
  echo "⚠️  Some tests failed. Please review the output above."
fi
echo ""
