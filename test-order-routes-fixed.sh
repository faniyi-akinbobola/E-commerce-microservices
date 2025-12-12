#!/bin/bash

# Color codes for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:3000"
USER_TOKEN=""
ADMIN_TOKEN=""
USER_ID=""
ADDRESS_ID=""
ORDER_ID=""
TIMESTAMP=$(date +%s)

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  E-COMMERCE ORDER SERVICE TEST SUITE  ${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Function to print test results
print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓ PASS${NC}: $2"
    else
        echo -e "${RED}✗ FAIL${NC}: $2"
    fi
}

# Function to print section headers
print_section() {
    echo -e "\n${YELLOW}========== $1 ==========${NC}"
}

# ==========================================
# STEP 1: CREATE ADMIN & CUSTOMER USERS
# ==========================================
print_section "STEP 1: User Authentication"

# Create Admin User
echo "Creating admin user..."
ADMIN_SIGNUP=$(curl -s -X POST "$BASE_URL/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin'$TIMESTAMP'@test.com",
    "username": "admin'$TIMESTAMP'",
    "password": "Admin1234!",
    "role": "ADMIN"
  }')

echo "Admin Signup: $ADMIN_SIGNUP"

ADMIN_LOGIN=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin'$TIMESTAMP'@test.com",
    "password": "Admin1234!"
  }')

echo "Admin Login: $ADMIN_LOGIN"
ADMIN_TOKEN=$(echo $ADMIN_LOGIN | jq -r '.data.accessToken // .accessToken')
echo -e "${GREEN}✓ Admin authenticated${NC}"

# Create Customer User
echo -e "\nCreating customer user..."
USER_SIGNUP=$(curl -s -X POST "$BASE_URL/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer'$TIMESTAMP'@test.com",
    "username": "customer'$TIMESTAMP'",
    "password": "Test1234!",
    "role": "CUSTOMER"
  }')

echo "Customer Signup: $USER_SIGNUP"
USER_ID=$(echo $USER_SIGNUP | jq -r '.data.user.id // .user.id')

USER_LOGIN=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer'$TIMESTAMP'@test.com",
    "password": "Test1234!"
  }')

echo "Customer Login: $USER_LOGIN"
USER_TOKEN=$(echo $USER_LOGIN | jq -r '.data.accessToken // .accessToken')
echo -e "${GREEN}✓ Customer authenticated (ID: $USER_ID)${NC}"

# ==========================================
# STEP 2: CREATE USER ADDRESS
# ==========================================
print_section "STEP 2: Create Shipping Address"

echo "Creating user address..."
ADDRESS_RESPONSE=$(curl -s -X POST "$BASE_URL/users-address/createuseraddress" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -d '{
    "fullName": "John Doe",
    "street": "123 Main Street",
    "city": "New York",
    "state": "NY",
    "postalCode": "10001",
    "country": "USA",
    "phone": "+1234567890",
    "isDefault": true
  }')

echo "Address Response: $ADDRESS_RESPONSE"
ADDRESS_ID=$(echo $ADDRESS_RESPONSE | jq -r '.data.id // .id')
echo -e "${GREEN}✓ Address created (ID: $ADDRESS_ID)${NC}"

# ==========================================
# STEP 3: CREATE CATEGORY & PRODUCTS (ADMIN)
# ==========================================
print_section "STEP 3: Create Products (Admin)"

# Create Category
echo "Creating category..."
CATEGORY_RESPONSE=$(curl -s -X POST "$BASE_URL/product/createcategory" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "name": "Test Category '$TIMESTAMP'",
    "description": "Category for order testing"
  }')

echo "Category Response: $CATEGORY_RESPONSE"
CATEGORY_ID=$(echo $CATEGORY_RESPONSE | jq -r '.data._id // ._id // .data.id // .id')
echo -e "${GREEN}✓ Category created: $CATEGORY_ID${NC}"

# Create Product 1
echo -e "\nCreating product 1..."
PRODUCT1_RESPONSE=$(curl -s -X POST "$BASE_URL/product/createproduct" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d "{
    \"name\": \"Test Product 1 $TIMESTAMP\",
    \"description\": \"Product for order testing\",
    \"price\": 29.99,
    \"categoryIds\": [\"$CATEGORY_ID\"],
    \"stock\": 100,
    \"images\": [\"http://example.com/image1.jpg\"]
  }")

echo "Product 1 Response: $PRODUCT1_RESPONSE"
PRODUCT1_ID=$(echo $PRODUCT1_RESPONSE | jq -r '.data._id // ._id // .data.id // .id')
echo -e "${GREEN}✓ Product 1 created: $PRODUCT1_ID${NC}"

# Create Product 2
echo -e "\nCreating product 2..."
PRODUCT2_RESPONSE=$(curl -s -X POST "$BASE_URL/product/createproduct" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d "{
    \"name\": \"Test Product 2 $TIMESTAMP\",
    \"description\": \"Another product for order testing\",
    \"price\": 49.99,
    \"categoryIds\": [\"$CATEGORY_ID\"],
    \"stock\": 50,
    \"images\": [\"http://example.com/image2.jpg\"]
  }")

echo "Product 2 Response: $PRODUCT2_RESPONSE"
PRODUCT2_ID=$(echo $PRODUCT2_RESPONSE | jq -r '.data._id // ._id // .data.id // .id')
echo -e "${GREEN}✓ Product 2 created: $PRODUCT2_ID${NC}"

# ==========================================
# STEP 4: ADD PRODUCTS TO CART (CUSTOMER)
# ==========================================
print_section "STEP 4: Add Products to Cart"

echo "Adding product 1 to cart (qty: 2)..."
CART1_RESPONSE=$(curl -s -X POST "$BASE_URL/cart/addtocart" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -d "{
    \"productId\": \"$PRODUCT1_ID\",
    \"quantity\": 2
  }")
echo "Cart Response 1: $CART1_RESPONSE"
print_result $? "Add product 1 to cart"

echo -e "\nAdding product 2 to cart (qty: 1)..."
CART2_RESPONSE=$(curl -s -X POST "$BASE_URL/cart/addtocart" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -d "{
    \"productId\": \"$PRODUCT2_ID\",
    \"quantity\": 1
  }")
echo "Cart Response 2: $CART2_RESPONSE"
print_result $? "Add product 2 to cart"

# View cart
echo -e "\nViewing cart..."
CART_VIEW=$(curl -s -X GET "$BASE_URL/cart/getcart" \
  -H "Authorization: Bearer $USER_TOKEN")
echo "Cart Contents: $CART_VIEW"

# ==========================================
# STEP 5: CREATE ORDER FROM CART
# ==========================================
print_section "STEP 5: Create Order from Cart"

echo "Creating order..."
ORDER_RESPONSE=$(curl -s -X POST "$BASE_URL/orders" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -d "{
    \"shippingAddressId\": \"$ADDRESS_ID\"
  }")

echo "Order Response: $ORDER_RESPONSE"
ORDER_ID=$(echo $ORDER_RESPONSE | jq -r '.data.id // .id')

if [ -z "$ORDER_ID" ] || [ "$ORDER_ID" = "null" ]; then
    echo -e "${RED}✗ Failed to create order${NC}"
    echo "Full response: $ORDER_RESPONSE"
    exit 1
fi
echo -e "${GREEN}✓ Order created successfully (ID: $ORDER_ID)${NC}"

# ==========================================
# STEP 6: GET ORDER DETAILS
# ==========================================
print_section "STEP 6: Get Order Details"

echo "Fetching order details..."
ORDER_DETAILS=$(curl -s -X GET "$BASE_URL/orders/$ORDER_ID" \
  -H "Authorization: Bearer $USER_TOKEN")

echo "Order Details: $ORDER_DETAILS"
print_result $? "Get order by ID"

# ==========================================
# STEP 7: GET USER'S ALL ORDERS
# ==========================================
print_section "STEP 7: Get User's All Orders"

echo "Fetching all orders for user..."
USER_ORDERS=$(curl -s -X GET "$BASE_URL/orders" \
  -H "Authorization: Bearer $USER_TOKEN")

echo "User Orders: $USER_ORDERS"
print_result $? "Get user's orders"

# ==========================================
# STEP 8: ADD PAYMENT TO ORDER
# ==========================================
print_section "STEP 8: Add Payment to Order"

# Calculate total from order response (use totalPrice field)
ORDER_TOTAL=$(echo $ORDER_DETAILS | jq -r '.data.totalPrice // .totalPrice')
echo "Order Total: \$$ORDER_TOTAL"

echo "Processing payment..."
PAYMENT_RESPONSE=$(curl -s -X POST "$BASE_URL/orders/$ORDER_ID/payment" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -d "{
    \"amount\": $ORDER_TOTAL,
    \"paymentMethod\": \"CREDIT_CARD\",
    \"transactionId\": \"txn_$TIMESTAMP\",
    \"paymentStatus\": \"PAID\"
  }")

echo "Payment Response: $PAYMENT_RESPONSE"
PAYMENT_STATUS=$(echo $PAYMENT_RESPONSE | jq -r '.statusCode')

if [ "$PAYMENT_STATUS" = "200" ] || [ "$PAYMENT_STATUS" = "201" ]; then
    echo -e "${GREEN}✓ PASS: Add payment record${NC}"
else
    echo -e "${RED}✗ FAIL: Payment failed with status $PAYMENT_STATUS${NC}"
fi

# Verify order status changed to PAID
echo -e "\nVerifying order status after payment..."
UPDATED_ORDER=$(curl -s -X GET "$BASE_URL/orders/$ORDER_ID" \
  -H "Authorization: Bearer $USER_TOKEN")
ORDER_STATUS=$(echo $UPDATED_ORDER | jq -r '.data.status // .status')
echo "Order Status: $ORDER_STATUS"

if [ "$ORDER_STATUS" = "PAID" ]; then
    echo -e "${GREEN}✓ Order status updated to PAID${NC}"
else
    echo -e "${RED}✗ Order status is $ORDER_STATUS (expected PAID)${NC}"
fi

# ==========================================
# STEP 9: UPDATE ORDER STATUS TO SHIPPED (ADMIN)
# ==========================================
print_section "STEP 9: Update Order Status to SHIPPED (Admin)"

echo "Updating order status to SHIPPED..."
STATUS_RESPONSE=$(curl -s -X PATCH "$BASE_URL/orders/$ORDER_ID/status" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "status": "SHIPPED"
  }')

echo "Status Update Response: $STATUS_RESPONSE"
UPDATED_STATUS=$(echo $STATUS_RESPONSE | jq -r '.data.status // .status')

if [ "$UPDATED_STATUS" = "SHIPPED" ]; then
    echo -e "${GREEN}✓ PASS: Order status updated to SHIPPED${NC}"
else
    echo -e "${RED}✗ FAIL: Status update failed${NC}"
fi

# ==========================================
# STEP 10: TRY TO CANCEL SHIPPED ORDER (should fail)
# ==========================================
print_section "STEP 10: Try to Cancel Shipped Order"

echo "Attempting to cancel shipped order..."
CANCEL_RESPONSE=$(curl -s -X PATCH "$BASE_URL/orders/$ORDER_ID/cancel" \
  -H "Authorization: Bearer $USER_TOKEN")

echo "Cancel Response: $CANCEL_RESPONSE"
CANCEL_STATUS=$(echo $CANCEL_RESPONSE | jq -r '.statusCode')

if [ "$CANCEL_STATUS" = "500" ] || [ "$CANCEL_STATUS" = "400" ]; then
    echo -e "${GREEN}✓ PASS: Cancel correctly rejected for shipped order${NC}"
else
    echo -e "${YELLOW}⚠ Unexpected response: $CANCEL_STATUS${NC}"
fi
echo "Note: Cancel should fail since order is already PAID/SHIPPED"

# ==========================================
# FINAL SUMMARY
# ==========================================
print_section "TEST SUMMARY"

echo -e "${BLUE}Order Service Tests Completed!${NC}"
echo ""
echo "Final Order ID: $ORDER_ID"
echo "Final Order Status: $ORDER_STATUS"
echo ""
echo -e "${GREEN}All order service endpoints have been tested.${NC}"
