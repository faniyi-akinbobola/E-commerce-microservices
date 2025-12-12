#!/bin/bash

# Simple order creation test
BASE_URL="http://localhost:3000"

# Using the test user created earlier
USER_ID="afdda669-0424-4887-9950-76ced679aa4a"
ADDRESS_ID="0637389a-a876-440f-821b-33c861a803e8"
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZmRkYTY2OS0wNDI0LTQ4ODctOTk1MC03NmNlZDY3OWFhNGEiLCJ1c2VybmFtZSI6InRlc3QxNzY1NDYzMjE2Iiwicm9sZSI6IkNVU1RPTUVSIiwiaWF0IjoxNzY1NDYzMjE2LCJleHAiOjE3NjU0NjY4MTZ9.qh95KtMkvHfgfTj8cPXS-jspK5_j5AUjUELJ_A3XsDY"

echo "Testing order creation with existing user and address..."
echo "User ID: $USER_ID"
echo "Address ID: $ADDRESS_ID"
echo ""

# Add some products to cart first (need to create them)
echo "Creating a quick product..."
# Create a simple category and product using admin
ADMIN_SIGNUP=$(curl -s -X POST "$BASE_URL/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "quickadmin@test.com",
    "username": "quickadmin",
    "password": "Admin1234!",
    "role": "ADMIN"
  }')

ADMIN_TOKEN=$(echo $ADMIN_SIGNUP | jq -r '.data.accessToken // .accessToken')
echo "Admin token: $ADMIN_TOKEN"

# Create category
CATEGORY=$(curl -s -X POST "$BASE_URL/product/createcategory" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "name": "Quick Test Category",
    "description": "Test"
  }')

CATEGORY_ID=$(echo $CATEGORY | jq -r '.data._id // ._id')
echo "Category ID: $CATEGORY_ID"

# Create product
PRODUCT=$(curl -s -X POST "$BASE_URL/product/createproduct" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d "{
    \"name\": \"Quick Test Product\",
    \"description\": \"Test product\",
    \"price\": 19.99,
    \"categoryIds\": [\"$CATEGORY_ID\"],
    \"stock\": 10,
    \"images\": [\"http://example.com/test.jpg\"]
  }")

PRODUCT_ID=$(echo $PRODUCT | jq -r '.data._id // ._id')
echo "Product ID: $PRODUCT_ID"
echo ""

# Add product to cart
echo "Adding product to cart..."
CART=$(curl -s -X POST "$BASE_URL/cart/addtocart" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"productId\": \"$PRODUCT_ID\",
    \"quantity\": 1
  }")
echo "Cart: $CART"
echo ""

# Now try to create order
echo "Creating order..."
ORDER=$(curl -v -X POST "$BASE_URL/orders" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"shippingAddressId\": \"$ADDRESS_ID\"
  }")

echo ""
echo "Order Response: $ORDER"
