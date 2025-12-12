#!/bin/bash

# Test if auth service is responding to RabbitMQ messages

BASE_URL="http://localhost:3000"
TIMESTAMP=$(date +%s)

echo "========== Testing Auth Service Communication =========="

# 1. Create a user and address
echo -e "\n1. Creating user..."
SIGNUP=$(curl -s -X POST "$BASE_URL/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test'$TIMESTAMP'@test.com",
    "username": "test'$TIMESTAMP'",
    "password": "Test1234!",
    "role": "CUSTOMER"
  }')

echo "Signup Response: $SIGNUP"
USER_ID=$(echo $SIGNUP | jq -r '.data.user.id // .user.id')
TOKEN=$(echo $SIGNUP | jq -r '.data.accessToken // .accessToken')

echo "User ID: $USER_ID"
echo "Token: $TOKEN"

# 2. Create address
echo -e "\n2. Creating address..."
ADDRESS=$(curl -s -X POST "$BASE_URL/users-address/createuseraddress" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "fullName": "Test User",
    "street": "123 Test St",
    "city": "Test City",
    "state": "TS",
    "postalCode": "12345",
    "country": "USA",
    "phone": "+1234567890",
    "isDefault": true
  }')

echo "Address Response: $ADDRESS"
ADDRESS_ID=$(echo $ADDRESS | jq -r '.data.id // .id')

echo "Address ID: $ADDRESS_ID"

# 3. Try to get the address back (via REST)
echo -e "\n3. Getting address via REST API..."
ADDRESS_GET=$(curl -s -X GET "$BASE_URL/users-address/getuseraddress" \
  -H "Authorization: Bearer $TOKEN")

echo "Get Address Response: $ADDRESS_GET"

echo -e "\n========== Test Complete =========="
echo "User ID: $USER_ID"
echo "Address ID: $ADDRESS_ID"
echo "Token: $TOKEN"
echo ""
echo "You can use these values to test order creation manually:"
echo "curl -X POST http://localhost:3000/orders \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -H 'Authorization: Bearer $TOKEN' \\"
echo "  -d '{\"shippingAddressId\": \"$ADDRESS_ID\"}'"
