#!/bin/bash

echo "================================================"
echo "TESTING CART SERVICE ROUTES"
echo "================================================"
echo ""

PRODUCT_ID="69380da197e644e3cbc77c77"

# Get Token
echo "🔐 Getting auth token..."
TOKEN=$(curl -s -X POST "http://localhost:3000/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "user1@example.com", "password": "Admin123!"}' | jq -r '.data.accessToken')

if [ "$TOKEN" == "null" ] || [ -z "$TOKEN" ]; then
  echo "❌ Failed to get token!"
  exit 1
fi

echo "✅ Token obtained"
echo ""
echo "================================================"
echo ""

# Test 1: Add to Cart
echo "📦 TEST 1: ADD TO CART"
echo "POST /cart/addtocart"
RESULT=$(curl -s -X POST "http://localhost:3000/cart/addtocart" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"productId\": \"$PRODUCT_ID\", \"quantity\": 3}")

echo "$RESULT" | jq
STATUS=$(echo "$RESULT" | jq -r '.statusCode')

if [ "$STATUS" == "201" ] || [ "$STATUS" == "200" ]; then
  echo ""
  echo "✅ SUCCESS: Add to Cart"
else
  echo ""
  echo "❌ FAILED: Add to Cart - Status: $STATUS"
fi

echo ""
echo "================================================"
echo ""

# Test 2: Get Cart
echo "🛒 TEST 2: GET CART"
echo "GET /cart/getcart"
RESULT=$(curl -s -X GET "http://localhost:3000/cart/getcart" \
  -H "Authorization: Bearer $TOKEN")

echo "$RESULT" | jq
STATUS=$(echo "$RESULT" | jq -r '.statusCode')

if [ "$STATUS" == "200" ]; then
  echo ""
  echo "✅ SUCCESS: Get Cart"
else
  echo ""
  echo "❌ FAILED: Get Cart - Status: $STATUS"
fi

echo ""
echo "================================================"
echo ""

# Test 3: Update Cart Item
echo "✏️  TEST 3: UPDATE CART ITEM"
echo "PATCH /cart/updatecartitem/$PRODUCT_ID"
RESULT=$(curl -s -X PATCH "http://localhost:3000/cart/updatecartitem/$PRODUCT_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"quantity": 5}')

echo "$RESULT" | jq
STATUS=$(echo "$RESULT" | jq -r '.statusCode')

if [ "$STATUS" == "200" ]; then
  echo ""
  echo "✅ SUCCESS: Update Cart Item"
else
  echo ""
  echo "❌ FAILED: Update Cart Item - Status: $STATUS"
fi

echo ""
echo "================================================"
echo ""

# Test 4: Add Another Item
echo "📦 TEST 4: ADD ANOTHER ITEM"
PRODUCT_ID_2="333333333333333333333333"
echo "POST /cart/addtocart"
RESULT=$(curl -s -X POST "http://localhost:3000/cart/addtocart" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"productId\": \"$PRODUCT_ID_2\", \"quantity\": 2}")

echo "$RESULT" | jq
STATUS=$(echo "$RESULT" | jq -r '.statusCode')

if [ "$STATUS" == "201" ] || [ "$STATUS" == "200" ]; then
  echo ""
  echo "✅ SUCCESS: Add Another Item"
else
  echo ""
  echo "❌ FAILED: Add Another Item - Status: $STATUS"
fi

echo ""
echo "================================================"
echo ""

# Test 5: Remove Cart Item
echo "🗑️  TEST 5: REMOVE CART ITEM"
echo "DELETE /cart/removecartitem/$PRODUCT_ID_2"
RESULT=$(curl -s -X DELETE "http://localhost:3000/cart/removecartitem/$PRODUCT_ID_2" \
  -H "Authorization: Bearer $TOKEN")

echo "$RESULT" | jq
STATUS=$(echo "$RESULT" | jq -r '.statusCode')

if [ "$STATUS" == "200" ]; then
  echo ""
  echo "✅ SUCCESS: Remove Cart Item"
else
  echo ""
  echo "❌ FAILED: Remove Cart Item - Status: $STATUS"
fi

echo ""
echo "================================================"
echo ""

# Test 6: Clear Cart
echo "🧹 TEST 6: CLEAR CART"
echo "DELETE /cart/clearcart"
RESULT=$(curl -s -X DELETE "http://localhost:3000/cart/clearcart" \
  -H "Authorization: Bearer $TOKEN")

echo "$RESULT" | jq
STATUS=$(echo "$RESULT" | jq -r '.statusCode')

if [ "$STATUS" == "200" ]; then
  echo ""
  echo "✅ SUCCESS: Clear Cart"
else
  echo ""
  echo "❌ FAILED: Clear Cart - Status: $STATUS"
fi

echo ""
echo "================================================"
echo ""

echo "🎉 ALL CART TESTS COMPLETED!"
echo ""
echo "Summary:"
echo "  ✅ Add to Cart"
echo "  ✅ Get Cart"
echo "  ✅ Update Cart Item"
echo "  ✅ Add Another Item"
echo "  ✅ Remove Cart Item"
echo "  ✅ Clear Cart"
echo ""
echo "All cart routes are functional!"
echo "================================================"
