#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:3000"
PASSED=0
FAILED=0

echo "========================================="
echo "INVENTORY SERVICE - FINAL TEST"
echo "========================================="
echo ""

# Get token
echo "=== Getting Authentication Token ==="
TOKEN=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@test.com", "password": "Admin123!"}' | grep -o '"accessToken":"[^"]*' | head -1 | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo -e "${RED}Failed to authenticate${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Authenticated${NC}"
echo ""

# Use existing product
PRODUCT_ID="69385420afa09fa1fce269b4"
NEW_PRODUCT_ID="69380da197e644e3cbc77c77"

print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓ PASSED${NC}: $2"
        ((PASSED++))
    else
        echo -e "${RED}✗ FAILED${NC}: $2"
        ((FAILED++))
    fi
}

# Test 1: Get Inventory for Product
echo "=== TEST 1: Get Inventory for Product ==="
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/inventory/getinventoryforproduct/$PRODUCT_ID" \
  -H "Authorization: Bearer $TOKEN")
STATUS=$(echo "$RESPONSE" | tail -1)
if [ "$STATUS" = "200" ]; then
    print_result 0 "Get Inventory for Product"
else
    print_result 1 "Get Inventory for Product (Status: $STATUS)"
fi
echo ""

# Test 2: Add Stock
echo "=== TEST 2: Add Stock ==="
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/inventory/addstock" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"productId\": \"$PRODUCT_ID\", \"quantity\": 10}")
STATUS=$(echo "$RESPONSE" | tail -1)
if [ "$STATUS" = "201" ] || [ "$STATUS" = "200" ]; then
    print_result 0 "Add Stock"
else
    print_result 1 "Add Stock (Status: $STATUS)"
fi
echo ""

# Test 3: Reduce Stock
echo "=== TEST 3: Reduce Stock ==="
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/inventory/reducestock" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"productId\": \"$PRODUCT_ID\", \"quantity\": 5}")
STATUS=$(echo "$RESPONSE" | tail -1)
if [ "$STATUS" = "201" ] || [ "$STATUS" = "200" ]; then
    print_result 0 "Reduce Stock"
else
    print_result 1 "Reduce Stock (Status: $STATUS)"
fi
echo ""

# Test 4: Reserve Stock
echo "=== TEST 4: Reserve Stock ==="
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/inventory/reservestock" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"productId\": \"$PRODUCT_ID\", \"quantity\": 8}")
STATUS=$(echo "$RESPONSE" | tail -1)
if [ "$STATUS" = "201" ] || [ "$STATUS" = "200" ]; then
    print_result 0 "Reserve Stock"
else
    print_result 1 "Reserve Stock (Status: $STATUS)"
fi
echo ""

# Test 5: Release Stock
echo "=== TEST 5: Release Stock ==="
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/inventory/releasestock" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"productId\": \"$PRODUCT_ID\", \"quantity\": 3}")
STATUS=$(echo "$RESPONSE" | tail -1)
if [ "$STATUS" = "201" ] || [ "$STATUS" = "200" ]; then
    print_result 0 "Release Stock"
else
    print_result 1 "Release Stock (Status: $STATUS)"
fi
echo ""

# Test 6: Update Inventory
echo "=== TEST 6: Update Inventory ==="
# First get the inventory ID
INV_RESPONSE=$(curl -s -X GET "$BASE_URL/inventory/getinventoryforproduct/$PRODUCT_ID" \
  -H "Authorization: Bearer $TOKEN")
INVENTORY_ID=$(echo $INV_RESPONSE | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

RESPONSE=$(curl -s -w "\n%{http_code}" -X PATCH "$BASE_URL/inventory/updateinventory/$INVENTORY_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"isActive": true}')
STATUS=$(echo "$RESPONSE" | tail -1)
if [ "$STATUS" = "200" ]; then
    print_result 0 "Update Inventory"
else
    print_result 1 "Update Inventory (Status: $STATUS)"
fi
echo ""

# Test 7: Create Inventory (for new product)
echo "=== TEST 7: Create Inventory for Different Product ==="
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/inventory/createinventory" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"productId\": \"$NEW_PRODUCT_ID\", \"quantity\": 100}")
STATUS=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | sed '$d')
if [ "$STATUS" = "201" ] || [ "$STATUS" = "200" ]; then
    print_result 0 "Create Inventory"
elif echo "$BODY" | grep -q "already exists"; then
    print_result 0 "Create Inventory (already exists - OK)"
else
    print_result 1 "Create Inventory (Status: $STATUS)"
fi
echo ""

# Test 8: Get Available Products
echo "=== TEST 8: Get Available Products ==="
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/inventory/getavailableproducts")
STATUS=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | sed '$d')
if [ "$STATUS" = "200" ] && echo "$BODY" | grep -q "data"; then
    print_result 0 "Get Available Products"
else
    print_result 1 "Get Available Products (Status: $STATUS)"
fi
echo ""

# Final Summary
echo "========================================="
echo "FINAL TEST SUMMARY"
echo "========================================="
TOTAL=$((PASSED + FAILED))
echo -e "Total Tests: $TOTAL"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 ALL INVENTORY ROUTES WORKING! 🎉${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠️  Some tests failed ⚠️${NC}"
    exit 1
fi
