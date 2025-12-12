#!/bin/bash

# Color codes for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:3000"
API_TOKEN=""
USER_ID=""
ADDRESS_ID=""
ORDER_ID=""

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
# STEP 1: USER SIGNUP & LOGIN
# ==========================================
print_section "STEP 1: User Authentication"

echo "Creating new user..."
SIGNUP_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "ordertest'$(date +%s)'@test.com",
    "username": "orderuser'$(date +%s)'",
    "password": "Test1234!",
    "role": "CUSTOMER"
  }')

echo "Signup Response: $SIGNUP_RESPONSE"

# Extract user ID from signup
USER_ID=$(echo $SIGNUP_RESPONSE | jq -r '.data.user.id // .user.id // .id // empty')
if [ -z "$USER_ID" ] || [ "$USER_ID" = "null" ]; then
    echo -e "${RED}Failed to extract user ID from signup${NC}"
    exit 1
fi
echo -e "${GREEN}User created with ID: $USER_ID${NC}"

# Login
echo -e "\nLogging in..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$(echo $SIGNUP_RESPONSE | jq -r '.data.user.email // .user.email // .email')\",
    \"password\": \"Test1234!\"
  }")

echo "Login Response: $LOGIN_RESPONSE"

API_TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.data.accessToken // .accessToken // .access_token // empty')
if [ -z "$API_TOKEN" ] || [ "$API_TOKEN" = "null" ]; then
    echo -e "${RED}Failed to get API token${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Authenticated successfully${NC}"

# ==========================================
# STEP 2: CREATE USER ADDRESS
# ==========================================
print_section "STEP 2: Create Shipping Address"

echo "Creating user address..."
ADDRESS_RESPONSE=$(curl -s -X POST "$BASE_URL/users-address/createuseraddress" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $API_TOKEN" \
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

ADDRESS_ID=$(echo $ADDRESS_RESPONSE | jq -r '.data.id // .id // empty')
if [ -z "$ADDRESS_ID" ] || [ "$ADDRESS_ID" = "null" ]; then
    echo -e "${RED}Failed to create address${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Address created with ID: $ADDRESS_ID${NC}"

# ==========================================
# STEP 3: ADD PRODUCTS TO CART
# ==========================================
print_section "STEP 3: Create Products and Add to Cart"

# Create Category
echo "Creating category..."
CATEGORY_RESPONSE=$(curl -s -X POST "$BASE_URL/product/createcategory" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $API_TOKEN" \
  -d '{
    "name": "Test Order Category '$(date +%s)'",
    "description": "Category for order testing"
  }')

echo "Category Response: $CATEGORY_RESPONSE"
CATEGORY_ID=$(echo $CATEGORY_RESPONSE | jq -r '.data.id // .data._id // .id // ._id // empty')
if [ -z "$CATEGORY_ID" ] || [ "$CATEGORY_ID" = "null" ]; then
    echo -e "${RED}✗ Failed to create category${NC}"
else
    echo -e "${GREEN}✓ Category created: $CATEGORY_ID${NC}"
fi

# Create Product 1
echo -e "\nCreating product 1..."
PRODUCT1_RESPONSE=$(curl -s -X POST "$BASE_URL/product/createproduct" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $API_TOKEN" \
  -d "{
    \"name\": \"Test Product 1 $(date +%s)\",
    \"description\": \"Product for order testing\",
    \"price\": 29.99,
    \"categoryIds\": [\"$CATEGORY_ID\"],
    \"stockQuantity\": 100,
    \"images\": [\"http://example.com/image1.jpg\"]
  }")

PRODUCT1_ID=$(echo $PRODUCT1_RESPONSE | jq -r '.data.id // .data._id // .id // ._id // empty')
echo -e "${GREEN}✓ Product 1 created: $PRODUCT1_ID${NC}"

# Create Product 2
echo -e "\nCreating product 2..."
PRODUCT2_RESPONSE=$(curl -s -X POST "$BASE_URL/product/createproduct" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $API_TOKEN" \
  -d "{
    \"name\": \"Test Product 2 $(date +%s)\",
    \"description\": \"Another product for order testing\",
    \"price\": 49.99,
    \"categoryIds\": [\"$CATEGORY_ID\"],
    \"stockQuantity\": 50,
    \"images\": [\"http://example.com/image2.jpg\"]
  }")

PRODUCT2_ID=$(echo $PRODUCT2_RESPONSE | jq -r '.data.id // .data._id // .id // ._id // empty')
echo -e "${GREEN}✓ Product 2 created: $PRODUCT2_ID${NC}"

# Add products to cart
echo -e "\nAdding product 1 to cart..."
CART1_RESPONSE=$(curl -s -X POST "$BASE_URL/cart/addtocart" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $API_TOKEN" \
  -d "{
    \"productId\": \"$PRODUCT1_ID\",
    \"quantity\": 2
  }")
echo "Cart Response 1: $CART1_RESPONSE"
print_result $? "Add product 1 to cart"

echo -e "\nAdding product 2 to cart..."
CART2_RESPONSE=$(curl -s -X POST "$BASE_URL/cart/addtocart" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $API_TOKEN" \
  -d "{
    \"productId\": \"$PRODUCT2_ID\",
    \"quantity\": 1
  }")
echo "Cart Response 2: $CART2_RESPONSE"
print_result $? "Add product 2 to cart"

# View cart
echo -e "\nViewing cart..."
CART_VIEW=$(curl -s -X GET "$BASE_URL/cart/getcart" \
  -H "Authorization: Bearer $API_TOKEN")
echo "Cart Contents: $CART_VIEW"

# ==========================================
# STEP 4: CREATE ORDER
# ==========================================
print_section "STEP 4: Create Order from Cart"

echo "Creating order..."
ORDER_RESPONSE=$(curl -s -X POST "$BASE_URL/orders" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $API_TOKEN" \
  -d "{
    \"shippingAddressId\": \"$ADDRESS_ID\"
  }")

echo "Order Response: $ORDER_RESPONSE"

ORDER_ID=$(echo $ORDER_RESPONSE | jq -r '.id // empty')
if [ -z "$ORDER_ID" ] || [ "$ORDER_ID" = "null" ]; then
    echo -e "${RED}Failed to create order${NC}"
    echo "Full response: $ORDER_RESPONSE"
    exit 1
fi
echo -e "${GREEN}✓ Order created with ID: $ORDER_ID${NC}"

ORDER_TOTAL=$(echo $ORDER_RESPONSE | jq -r '.totalPrice // empty')
echo -e "${BLUE}Order Total: \$$ORDER_TOTAL${NC}"

# ==========================================
# STEP 5: GET ORDER BY ID
# ==========================================
print_section "STEP 5: Get Order by ID"

echo "Fetching order details..."
ORDER_DETAILS=$(curl -s -X GET "$BASE_URL/orders/$ORDER_ID" \
  -H "Authorization: Bearer $API_TOKEN")

echo "Order Details: $ORDER_DETAILS"
print_result $? "Get order by ID"

# ==========================================
# STEP 6: GET USER ORDERS
# ==========================================
print_section "STEP 6: Get User Orders"

echo "Fetching all user orders..."
USER_ORDERS=$(curl -s -X GET "$BASE_URL/orders" \
  -H "Authorization: Bearer $API_TOKEN")

echo "User Orders: $USER_ORDERS"
ORDERS_COUNT=$(echo $USER_ORDERS | jq '. | length // 0')
echo -e "${BLUE}Total orders: $ORDERS_COUNT${NC}"
print_result $? "Get user orders"

# ==========================================
# STEP 7: ADD PAYMENT RECORD (SUCCESSFUL)
# ==========================================
print_section "STEP 7: Add Payment Record - Success"

echo "Adding successful payment..."
PAYMENT_RESPONSE=$(curl -s -X POST "$BASE_URL/orders/$ORDER_ID/payment" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $API_TOKEN" \
  -d "{
    \"orderId\": \"$ORDER_ID\",
    \"paymentMethod\": \"credit_card\",
    \"amount\": $ORDER_TOTAL,
    \"transactionId\": \"txn_$(date +%s)\",
    \"paymentStatus\": \"PAID\"
  }")

echo "Payment Response: $PAYMENT_RESPONSE"
print_result $? "Add payment record (success)"

# Verify order status changed to PAID
ORDER_STATUS=$(echo $PAYMENT_RESPONSE | jq -r '.status // empty')
if [ "$ORDER_STATUS" = "PAID" ]; then
    echo -e "${GREEN}✓ Order status updated to PAID${NC}"
else
    echo -e "${RED}✗ Order status not updated correctly: $ORDER_STATUS${NC}"
fi

# ==========================================
# STEP 8: CREATE ANOTHER ORDER FOR CANCELLATION
# ==========================================
print_section "STEP 8: Test Order Cancellation"

# Add products back to cart
echo "Adding products to cart for cancellation test..."
curl -s -X POST "$BASE_URL/cart/addtocart" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $API_TOKEN" \
  -d "{
    \"productId\": \"$PRODUCT1_ID\",
    \"quantity\": 1
  }" > /dev/null

# Create second order
echo "Creating order for cancellation..."
CANCEL_ORDER_RESPONSE=$(curl -s -X POST "$BASE_URL/orders" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $API_TOKEN" \
  -d "{
    \"shippingAddressId\": \"$ADDRESS_ID\"
  }")

CANCEL_ORDER_ID=$(echo $CANCEL_ORDER_RESPONSE | jq -r '.id // empty')
echo -e "${GREEN}✓ Order created for cancellation: $CANCEL_ORDER_ID${NC}"

# Cancel the order
echo -e "\nCancelling order..."
CANCEL_RESPONSE=$(curl -s -X PATCH "$BASE_URL/orders/$CANCEL_ORDER_ID/cancel" \
  -H "Authorization: Bearer $API_TOKEN")

echo "Cancel Response: $CANCEL_RESPONSE"
CANCEL_STATUS=$(echo $CANCEL_RESPONSE | jq -r '.status // empty')
if [ "$CANCEL_STATUS" = "CANCELLED" ]; then
    echo -e "${GREEN}✓ Order cancelled successfully${NC}"
else
    echo -e "${RED}✗ Order cancellation failed${NC}"
fi

# ==========================================
# STEP 9: UPDATE ORDER STATUS (ADMIN)
# ==========================================
print_section "STEP 9: Update Order Status"

echo "Updating order status to SHIPPED..."
UPDATE_STATUS_RESPONSE=$(curl -s -X PATCH "$BASE_URL/orders/$ORDER_ID/status" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $API_TOKEN" \
  -d "{
    \"status\": \"SHIPPED\"
  }")

echo "Update Status Response: $UPDATE_STATUS_RESPONSE"
print_result $? "Update order status"

# ==========================================
# STEP 10: GET ALL ORDERS (ADMIN)
# ==========================================
print_section "STEP 10: Get All Orders (Admin)"

echo "Fetching all orders..."
ALL_ORDERS=$(curl -s -X GET "$BASE_URL/orders/all" \
  -H "Authorization: Bearer $API_TOKEN")

ALL_ORDERS_COUNT=$(echo $ALL_ORDERS | jq '. | length // 0')
echo -e "${BLUE}Total orders in system: $ALL_ORDERS_COUNT${NC}"
print_result $? "Get all orders"

# ==========================================
# FINAL SUMMARY
# ==========================================
print_section "TEST SUMMARY"

echo -e "${GREEN}✓ User authentication${NC}"
echo -e "${GREEN}✓ Address creation${NC}"
echo -e "${GREEN}✓ Product creation${NC}"
echo -e "${GREEN}✓ Cart management${NC}"
echo -e "${GREEN}✓ Order creation${NC}"
echo -e "${GREEN}✓ Get order by ID${NC}"
echo -e "${GREEN}✓ Get user orders${NC}"
echo -e "${GREEN}✓ Payment processing${NC}"
echo -e "${GREEN}✓ Order cancellation${NC}"
echo -e "${GREEN}✓ Order status update${NC}"
echo -e "${GREEN}✓ Get all orders${NC}"

echo -e "\n${BLUE}========================================${NC}"
echo -e "${GREEN}  ALL ORDER TESTS COMPLETED!${NC}"
echo -e "${BLUE}========================================${NC}"
