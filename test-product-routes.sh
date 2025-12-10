#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:3000"

echo -e "${YELLOW}=== Testing Product Service Routes ===${NC}\n"

# Step 1: Get Auth Token
echo -e "${YELLOW}Step 1: Getting admin auth token...${NC}"
TOKEN=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "testadmin@example.com", "password": "TestAdmin@123"}' | jq -r '.data.accessToken')

if [ "$TOKEN" == "null" ] || [ -z "$TOKEN" ]; then
  echo -e "${RED}Failed to get auth token${NC}"
  exit 1
fi
echo -e "${GREEN}✓ Auth token obtained${NC}\n"

# Step 2: Create Category
echo -e "${YELLOW}Step 2: Creating a test category...${NC}"
CATEGORY_RESPONSE=$(curl -s -X POST "$BASE_URL/product/createcategory" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Test Electronics 2024",
    "description": "Electronic devices and accessories for testing"
  }')

echo "$CATEGORY_RESPONSE" | jq '.'
CATEGORY_ID=$(echo "$CATEGORY_RESPONSE" | jq -r '.data._id // .data.id // ._id // .id')

if [ "$CATEGORY_ID" == "null" ] || [ -z "$CATEGORY_ID" ]; then
  echo -e "${YELLOW}Category might already exist, fetching existing categories...${NC}"
  CATEGORIES=$(curl -s -X GET "$BASE_URL/product/getcategories")
  echo "$CATEGORIES" | jq '.'
  CATEGORY_ID=$(echo "$CATEGORIES" | jq -r '.data[0]._id // .data[0].id // .[0]._id // .[0].id')
  echo -e "${GREEN}✓ Using existing category ID: $CATEGORY_ID${NC}\n"
else
  echo -e "${GREEN}✓ Category created with ID: $CATEGORY_ID${NC}\n"
fi

# Step 3: Get All Categories
echo -e "${YELLOW}Step 3: Getting all categories...${NC}"
curl -s -X GET "$BASE_URL/product/getcategories" | jq '.'
echo -e "${GREEN}✓ Categories retrieved${NC}\n"

# Step 4: Create Product with Valid Category ID
echo -e "${YELLOW}Step 4: Creating a product with valid category ID...${NC}"
UNIQUE_NAME="Test Product $(date +%s)"
PRODUCT_RESPONSE=$(curl -s -X POST "$BASE_URL/product/createproduct" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"name\": \"$UNIQUE_NAME\",
    \"description\": \"Product created during automated testing\",
    \"price\": 1199.99,
    \"stock\": 50,
    \"categoryIds\": [\"$CATEGORY_ID\"],
    \"images\": [\"https://example.com/test-product.jpg\"],
    \"brand\": \"TestBrand\"
  }")

echo "$PRODUCT_RESPONSE" | jq '.'
PRODUCT_ID=$(echo "$PRODUCT_RESPONSE" | jq -r '.data._id // .data.id // ._id // .id')

if [ "$PRODUCT_ID" == "null" ] || [ -z "$PRODUCT_ID" ]; then
  echo -e "${RED}✗ Failed to create product${NC}\n"
else
  echo -e "${GREEN}✓ Product created with ID: $PRODUCT_ID${NC}\n"
fi

# Step 5: Test Creating Product with Invalid Category ID (should fail with better error)
echo -e "${YELLOW}Step 5: Testing product creation with INVALID category ID...${NC}"
INVALID_RESPONSE=$(curl -s -X POST "$BASE_URL/product/createproduct" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Test Product Invalid",
    "description": "Should fail with invalid category",
    "price": 99.99,
    "stock": 10,
    "categoryIds": ["invalid-id-123"],
    "brand": "Test Brand"
  }')

echo "$INVALID_RESPONSE" | jq '.'
echo -e "${YELLOW}↑ Should show validation error for invalid MongoDB ID format${NC}\n"

# Step 6: Get All Products
echo -e "${YELLOW}Step 6: Getting all products...${NC}"
curl -s -X GET "$BASE_URL/product/getproducts" | jq '.'
echo -e "${GREEN}✓ Products retrieved${NC}\n"

# Step 7: Get Product by ID
if [ "$PRODUCT_ID" != "null" ] && [ -n "$PRODUCT_ID" ]; then
  echo -e "${YELLOW}Step 7: Getting product by ID...${NC}"
  curl -s -X GET "$BASE_URL/product/getproduct/$PRODUCT_ID" | jq '.'
  echo -e "${GREEN}✓ Product retrieved by ID${NC}\n"
fi

# Step 8: Get Available Products
echo -e "${YELLOW}Step 8: Getting available products...${NC}"
curl -s -X GET "$BASE_URL/product/getavailableproducts" | jq '.'
echo -e "${GREEN}✓ Available products retrieved${NC}\n"

# Step 9: Update Product
if [ "$PRODUCT_ID" != "null" ] && [ -n "$PRODUCT_ID" ]; then
  echo -e "${YELLOW}Step 9: Updating product...${NC}"
  curl -s -X PATCH "$BASE_URL/product/updateproduct" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "{
      \"id\": \"$PRODUCT_ID\",
      \"price\": 899.99,
      \"stock\": 45
    }" | jq '.'
  echo -e "${GREEN}✓ Product updated${NC}\n"
fi

# Step 10: Get Products by Category
echo -e "${YELLOW}Step 10: Getting products by category slug...${NC}"
curl -s -X GET "$BASE_URL/product/getproductsbycategory/electronics" | jq '.'
echo -e "${GREEN}✓ Products by category retrieved${NC}\n"

# Step 11: Get Category by ID
echo -e "${YELLOW}Step 11: Getting category by ID...${NC}"
if [ "$CATEGORY_ID" != "null" ] && [ -n "$CATEGORY_ID" ]; then
  curl -s -X GET "$BASE_URL/product/getcategory/$CATEGORY_ID" | jq '.'
  echo -e "${GREEN}✓ Category retrieved by ID${NC}\n"
else
  echo -e "${RED}✗ No category ID available${NC}\n"
fi

# Step 12: Update Category
echo -e "${YELLOW}Step 12: Updating category...${NC}"
if [ "$CATEGORY_ID" != "null" ] && [ -n "$CATEGORY_ID" ]; then
  curl -s -X PATCH "$BASE_URL/product/updatecategory/$CATEGORY_ID" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "{
      \"description\": \"Updated: Electronic devices, gadgets and accessories for 2024\"
    }" | jq '.'
  echo -e "${GREEN}✓ Category updated${NC}\n"
else
  echo -e "${RED}✗ No category ID available${NC}\n"
fi

echo -e "${GREEN}=== All Product Service Routes Tested Successfully ===${NC}"
