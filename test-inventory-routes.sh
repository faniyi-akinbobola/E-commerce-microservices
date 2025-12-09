#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Base URL
BASE_URL="http://localhost:3000"

# Counter for passed/failed tests
PASSED=0
FAILED=0

echo "========================================="
echo "INVENTORY SERVICE ROUTES TEST"
echo "========================================="
echo ""

# Function to print test result
print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓ PASSED${NC}: $2"
        ((PASSED++))
    else
        echo -e "${RED}✗ FAILED${NC}: $2"
        ((FAILED++))
    fi
}

# First, we need to login to get JWT token
echo "=== AUTHENTICATION ==="
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "Admin123!"
  }')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo -e "${RED}Failed to get authentication token. Creating admin user...${NC}"
    
    # Register admin user
    REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/signup" \
      -H "Content-Type: application/json" \
      -d '{
        "username": "adminuser",
        "email": "admin@test.com",
        "password": "Admin123!",
        "role": "ADMIN"
      }')
    
    echo "Signup response: $REGISTER_RESPONSE"
    
    # Try login again
    LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
      -H "Content-Type: application/json" \
      -d '{
        "email": "admin@test.com",
        "password": "Admin123!"
      }')
    
    TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
fi

if [ -z "$TOKEN" ]; then
    echo -e "${RED}Failed to authenticate. Exiting...${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Authentication successful${NC}"
echo ""

# First, create a category and product to test with
echo "=== SETUP: Creating test data ==="

CATEGORY_RESPONSE=$(curl -s -X POST "$BASE_URL/product/createcategory" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Test Electronics",
    "description": "Electronics for inventory testing"
  }')

CATEGORY_ID=$(echo $CATEGORY_RESPONSE | grep -o '"_id":"[^"]*' | head -1 | cut -d'"' -f4)
echo "Category Response: $CATEGORY_RESPONSE"
echo "Category ID: $CATEGORY_ID"

PRODUCT_RESPONSE=$(curl -s -X POST "$BASE_URL/product/createproduct" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"name\": \"Test Laptop\",
    \"description\": \"A laptop for inventory testing\",
    \"price\": 999.99,
    \"stock\": 50,
    \"categoryIds\": [\"$CATEGORY_ID\"],
    \"brand\": \"TestBrand\"
  }")

PRODUCT_ID=$(echo $PRODUCT_RESPONSE | grep -o '"_id":"[^"]*' | head -1 | cut -d'"' -f4)
echo "Product Response: $PRODUCT_RESPONSE"
echo "Product ID: $PRODUCT_ID"
echo ""

# 1. Create Inventory
echo "=== TEST 1: Create Inventory ==="
CREATE_INV_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/inventory/createinventory" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"productId\": \"$PRODUCT_ID\",
    \"quantity\": 100
  }")

STATUS=$(echo "$CREATE_INV_RESPONSE" | tail -1)
BODY=$(echo "$CREATE_INV_RESPONSE" | sed '$d')
INVENTORY_ID=$(echo $BODY | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ "$STATUS" = "201" ] || [ "$STATUS" = "200" ]; then
    print_result 0 "Create Inventory (Status: $STATUS)"
    echo "Inventory ID: $INVENTORY_ID"
else
    print_result 1 "Create Inventory (Status: $STATUS)"
    echo "Response: $BODY"
fi
echo ""

# 2. Get Inventory for Product
echo "=== TEST 2: Get Inventory for Product ==="
GET_INV_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/inventory/getinventoryforproduct/$PRODUCT_ID" \
  -H "Authorization: Bearer $TOKEN")

STATUS=$(echo "$GET_INV_RESPONSE" | tail -1)
BODY=$(echo "$GET_INV_RESPONSE" | sed '$d')

if [ "$STATUS" = "200" ]; then
    print_result 0 "Get Inventory for Product (Status: $STATUS)"
else
    print_result 1 "Get Inventory for Product (Status: $STATUS)"
    echo "Response: $BODY"
fi
echo ""

# 3. Add Stock
echo "=== TEST 3: Add Stock ==="
ADD_STOCK_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/inventory/addstock" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"productId\": \"$PRODUCT_ID\",
    \"quantity\": 25
  }")

STATUS=$(echo "$ADD_STOCK_RESPONSE" | tail -1)
BODY=$(echo "$ADD_STOCK_RESPONSE" | sed '$d')

if [ "$STATUS" = "201" ] || [ "$STATUS" = "200" ]; then
    print_result 0 "Add Stock (Status: $STATUS)"
else
    print_result 1 "Add Stock (Status: $STATUS)"
    echo "Response: $BODY"
fi
echo ""

# 4. Reduce Stock
echo "=== TEST 4: Reduce Stock ==="
REDUCE_STOCK_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/inventory/reducestock" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"productId\": \"$PRODUCT_ID\",
    \"quantity\": 10
  }")

STATUS=$(echo "$REDUCE_STOCK_RESPONSE" | tail -1)
BODY=$(echo "$REDUCE_STOCK_RESPONSE" | sed '$d')

if [ "$STATUS" = "201" ] || [ "$STATUS" = "200" ]; then
    print_result 0 "Reduce Stock (Status: $STATUS)"
else
    print_result 1 "Reduce Stock (Status: $STATUS)"
    echo "Response: $BODY"
fi
echo ""

# 5. Reserve Stock
echo "=== TEST 5: Reserve Stock ==="
RESERVE_STOCK_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/inventory/reservestock" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"productId\": \"$PRODUCT_ID\",
    \"quantity\": 15
  }")

STATUS=$(echo "$RESERVE_STOCK_RESPONSE" | tail -1)
BODY=$(echo "$RESERVE_STOCK_RESPONSE" | sed '$d')

if [ "$STATUS" = "201" ] || [ "$STATUS" = "200" ]; then
    print_result 0 "Reserve Stock (Status: $STATUS)"
else
    print_result 1 "Reserve Stock (Status: $STATUS)"
    echo "Response: $BODY"
fi
echo ""

# 6. Release Stock
echo "=== TEST 6: Release Stock ==="
RELEASE_STOCK_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/inventory/releasestock" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"productId\": \"$PRODUCT_ID\",
    \"quantity\": 5
  }")

STATUS=$(echo "$RELEASE_STOCK_RESPONSE" | tail -1)
BODY=$(echo "$RELEASE_STOCK_RESPONSE" | sed '$d')

if [ "$STATUS" = "201" ] || [ "$STATUS" = "200" ]; then
    print_result 0 "Release Stock (Status: $STATUS)"
else
    print_result 1 "Release Stock (Status: $STATUS)"
    echo "Response: $BODY"
fi
echo ""

# 7. Update Inventory
echo "=== TEST 7: Update Inventory ==="
UPDATE_INV_RESPONSE=$(curl -s -w "\n%{http_code}" -X PATCH "$BASE_URL/inventory/updateinventory/$INVENTORY_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "isActive": true
  }')

STATUS=$(echo "$UPDATE_INV_RESPONSE" | tail -1)
BODY=$(echo "$UPDATE_INV_RESPONSE" | sed '$d')

if [ "$STATUS" = "200" ]; then
    print_result 0 "Update Inventory (Status: $STATUS)"
else
    print_result 1 "Update Inventory (Status: $STATUS)"
    echo "Response: $BODY"
fi
echo ""

# 8. Get Available Products
echo "=== TEST 8: Get Available Products ==="
GET_AVAILABLE_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/inventory/getavailableproducts")

STATUS=$(echo "$GET_AVAILABLE_RESPONSE" | tail -1)
BODY=$(echo "$GET_AVAILABLE_RESPONSE" | sed '$d')

if [ "$STATUS" = "200" ]; then
    print_result 0 "Get Available Products (Status: $STATUS)"
else
    print_result 1 "Get Available Products (Status: $STATUS)"
    echo "Response: $BODY"
fi
echo ""

# Final Summary
echo "========================================="
echo "TEST SUMMARY"
echo "========================================="
TOTAL=$((PASSED + FAILED))
echo -e "Total Tests: $TOTAL"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 ALL TESTS PASSED! 🎉${NC}"
    exit 0
else
    echo -e "${RED}❌ SOME TESTS FAILED ❌${NC}"
    exit 1
fi
