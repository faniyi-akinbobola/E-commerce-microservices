#!/bin/bash

echo "================================"
echo "Testing Inventory Routes"
echo "================================"
echo ""

PRODUCT_ID="69380da197e644e3cbc77c77"

# First, let's check if we need to bypass auth temporarily
# Check current inventory
echo "1. Testing GET inventory for product..."
curl -s -X GET "http://localhost:3000/inventory/getinventoryforproduct/$PRODUCT_ID" | jq

echo ""
echo "================================"
echo ""

# Test createInventory
echo "2. Testing CREATE inventory..."
curl -s -X POST http://localhost:3000/inventory/createinventory \
  -H "Content-Type: application/json" \
  -d "{
    \"productId\": \"$PRODUCT_ID\",
    \"quantity\": 100
  }" | jq

echo ""
echo "================================"
echo ""

# Test updateInventory
echo "3. Testing UPDATE inventory..."
curl -s -X PATCH "http://localhost:3000/inventory/updateinventory/$PRODUCT_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "quantity": 120
  }' | jq

echo ""
echo "================================"
echo ""

# Test releaseStock
echo "4. Testing RELEASE stock..."
curl -s -X POST http://localhost:3000/inventory/releasestock \
  -H "Content-Type: application/json" \
  -d "{
    \"productId\": \"$PRODUCT_ID\",
    \"quantity\": 2
  }" | jq

echo ""
echo "================================"
echo "All tests completed!"
echo "================================"
