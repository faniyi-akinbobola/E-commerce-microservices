#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get admin token
echo -e "${BLUE}=== Registering/Logging in Admin User ===${NC}"
TOKEN=$(curl -s -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testadmin2",
    "email": "testadmin2@test.com",
    "password": "Admin123!@#",
    "role": "ADMIN"
  }' | jq -r '.data.accessToken')

if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
  echo -e "${YELLOW}Signup failed, trying login...${NC}"
  TOKEN=$(curl -s -X POST http://localhost:3000/auth/login \
    -H "Content-Type: application/json" \
    -d '{
      "username": "admin",
      "password": "Admin123!@#"
    }' | jq -r '.data.accessToken')
fi

echo -e "${GREEN}Token obtained: ${TOKEN:0:50}...${NC}\n"

# Test 1: Create Category
echo -e "${BLUE}=== TEST 1: Create Category (Electronics) ===${NC}"
CATEGORY_RESPONSE=$(curl -s -X POST http://localhost:3000/product/createcategory \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Electronics",
    "description": "Electronic devices and accessories"
  }')
echo "$CATEGORY_RESPONSE" | jq .
CATEGORY_ID=$(echo "$CATEGORY_RESPONSE" | jq -r '.data._id')
echo -e "${GREEN}Category ID: $CATEGORY_ID${NC}\n"

# Test 2: Create Another Category
echo -e "${BLUE}=== TEST 2: Create Category (Clothing) ===${NC}"
curl -s -X POST http://localhost:3000/product/createcategory \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Clothing",
    "description": "Men and Women clothing"
  }' | jq .
echo ""

# Test 3: Get All Categories
echo -e "${BLUE}=== TEST 3: Get All Categories ===${NC}"
curl -s -X GET http://localhost:3000/product/getcategories \
  -H "Authorization: Bearer $TOKEN" | jq .
echo ""

# Test 4: Get Category by ID
echo -e "${BLUE}=== TEST 4: Get Category by ID ===${NC}"
curl -s -X GET "http://localhost:3000/product/getcategory/$CATEGORY_ID" \
  -H "Authorization: Bearer $TOKEN" | jq .
echo ""

# Test 5: Get Category by Slug
echo -e "${BLUE}=== TEST 5: Get Category by Slug ===${NC}"
curl -s -X GET "http://localhost:3000/product/getcategoriesbyslug/electronics" \
  -H "Authorization: Bearer $TOKEN" | jq .
echo ""

# Test 6: Create Product
echo -e "${BLUE}=== TEST 6: Create Product (Wireless Mouse) ===${NC}"
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
echo -e "${GREEN}Product ID: $PRODUCT_ID${NC}\n"

# Test 7: Create Another Product
echo -e "${BLUE}=== TEST 7: Create Product (Mechanical Keyboard) ===${NC}"
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

# Test 8: Get All Products
echo -e "${BLUE}=== TEST 8: Get All Products ===${NC}"
curl -s -X GET http://localhost:3000/product/getproducts \
  -H "Authorization: Bearer $TOKEN" | jq .
echo ""

# Test 9: Get Product by ID
echo -e "${BLUE}=== TEST 9: Get Product by ID ===${NC}"
curl -s -X GET "http://localhost:3000/product/getproduct/$PRODUCT_ID" \
  -H "Authorization: Bearer $TOKEN" | jq .
echo ""

# Test 10: Get Product by Slug
echo -e "${BLUE}=== TEST 10: Get Product by Slug ===${NC}"
curl -s -X GET "http://localhost:3000/product/getproductsbyslug/wireless-mouse" \
  -H "Authorization: Bearer $TOKEN" | jq .
echo ""

# Test 11: Get Available Products
echo -e "${BLUE}=== TEST 11: Get Available Products ===${NC}"
curl -s -X GET "http://localhost:3000/product/getavailableproducts" \
  -H "Authorization: Bearer $TOKEN" | jq .
echo ""

# Test 12: Get Products by Category
echo -e "${BLUE}=== TEST 12: Get Products by Category (electronics) ===${NC}"
curl -s -X GET "http://localhost:3000/product/getproductsbycategory/electronics" \
  -H "Authorization: Bearer $TOKEN" | jq .
echo ""

# Test 13: Update Product
echo -e "${BLUE}=== TEST 13: Update Product (change price and stock) ===${NC}"
curl -s -X PATCH http://localhost:3000/product/updateproduct \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"id\": \"$PRODUCT_ID\",
    \"price\": 24.99,
    \"stock\": 150
  }" | jq .
echo ""

# Test 14: Update Category
echo -e "${BLUE}=== TEST 14: Update Category ===${NC}"
curl -s -X PATCH "http://localhost:3000/product/updatecategory/$CATEGORY_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Electronics & Gadgets",
    "description": "All electronic devices and gadgets"
  }' | jq .
echo ""

# Test 15: Delete Product
echo -e "${BLUE}=== TEST 15: Delete Product ===${NC}"
curl -s -X DELETE "http://localhost:3000/product/deleteproduct/$PRODUCT_ID" \
  -H "Authorization: Bearer $TOKEN" | jq .
echo ""

# Test 16: Delete Category
echo -e "${BLUE}=== TEST 16: Delete Category ===${NC}"
curl -s -X DELETE "http://localhost:3000/product/deletecategory/$CATEGORY_ID" \
  -H "Authorization: Bearer $TOKEN" | jq .
echo ""

echo -e "${GREEN}=== All tests completed! ===${NC}"
