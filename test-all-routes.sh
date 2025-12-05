#!/bin/bash

BASE_URL="http://localhost:3000"

echo "=========================================="
echo "Testing Auth and Users Routes"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test 1: Signup
echo -e "${BLUE}1. Testing Signup${NC}"
SIGNUP_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "testuser@example.com",
    "password": "Test@1234",
    "role": "CUSTOMER"
  }')
echo "$SIGNUP_RESPONSE" | jq .
SIGNUP_TOKEN=$(echo "$SIGNUP_RESPONSE" | jq -r '.access_token // empty')
echo ""

# Test 2: Login
echo -e "${BLUE}2. Testing Login${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "Test@1234"
  }')
echo "$LOGIN_RESPONSE" | jq .
ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.access_token // empty')
REFRESH_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.refresh_token // empty')
echo ""

# Test 3: Get Profile (Protected)
echo -e "${BLUE}3. Testing Get Profile (Protected)${NC}"
if [ -n "$ACCESS_TOKEN" ]; then
  curl -s -X GET "$BASE_URL/auth/getprofile" \
    -H "Authorization: Bearer $ACCESS_TOKEN" | jq .
else
  echo -e "${RED}No access token available${NC}"
fi
echo ""

# Test 4: Refresh Token
echo -e "${BLUE}4. Testing Refresh Token${NC}"
if [ -n "$REFRESH_TOKEN" ]; then
  curl -s -X POST "$BASE_URL/auth/refreshtoken" \
    -H "Content-Type: application/json" \
    -d "{
      \"refreshToken\": \"$REFRESH_TOKEN\"
    }" | jq .
else
  echo -e "${RED}No refresh token available${NC}"
fi
echo ""

# Test 5: Change Password (Protected)
echo -e "${BLUE}5. Testing Change Password (Protected)${NC}"
if [ -n "$ACCESS_TOKEN" ]; then
  curl -s -X POST "$BASE_URL/auth/changepassword" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -d '{
      "oldPassword": "Test@1234",
      "newPassword": "NewTest@1234"
    }' | jq .
  
  # Login again with new password
  echo -e "${BLUE}5b. Re-login with new password${NC}"
  LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{
      "email": "testuser@example.com",
      "password": "NewTest@1234"
    }')
  echo "$LOGIN_RESPONSE" | jq .
  ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.access_token // empty')
else
  echo -e "${RED}No access token available${NC}"
fi
echo ""

# Test 6: Forgot Password
echo -e "${BLUE}6. Testing Forgot Password${NC}"
curl -s -X POST "$BASE_URL/auth/forgotpassword" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com"
  }' | jq .
echo ""

# Test 7: Get All Users (Protected)
echo -e "${BLUE}7. Testing Get All Users (Protected)${NC}"
if [ -n "$ACCESS_TOKEN" ]; then
  curl -s -X GET "$BASE_URL/users/getusers" \
    -H "Authorization: Bearer $ACCESS_TOKEN" | jq .
else
  echo -e "${RED}No access token available${NC}"
fi
echo ""

# Test 8: Get User by ID (Protected)
echo -e "${BLUE}8. Testing Get User by ID (Protected)${NC}"
if [ -n "$ACCESS_TOKEN" ]; then
  PROFILE=$(curl -s -X GET "$BASE_URL/auth/getprofile" \
    -H "Authorization: Bearer $ACCESS_TOKEN")
  USER_ID=$(echo "$PROFILE" | jq -r '.id // empty')
  
  if [ -n "$USER_ID" ]; then
    curl -s -X GET "$BASE_URL/users/getuser/$USER_ID" \
      -H "Authorization: Bearer $ACCESS_TOKEN" | jq .
  else
    echo -e "${RED}Could not get user ID${NC}"
  fi
else
  echo -e "${RED}No access token available${NC}"
fi
echo ""

# Test 9: Update User (Protected)
echo -e "${BLUE}9. Testing Update User (Protected)${NC}"
if [ -n "$ACCESS_TOKEN" ]; then
  curl -s -X PATCH "$BASE_URL/users/updateuser" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -d '{
      "username": "updatedtestuser"
    }' | jq .
else
  echo -e "${RED}No access token available${NC}"
fi
echo ""

# Test 10: Create User Address (Protected)
echo -e "${BLUE}10. Testing Create User Address (Protected)${NC}"
if [ -n "$ACCESS_TOKEN" ]; then
  ADDRESS_RESPONSE=$(curl -s -X POST "$BASE_URL/users-address/createuseraddress" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -d '{
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "country": "USA",
      "zipCode": "10001"
    }')
  echo "$ADDRESS_RESPONSE" | jq .
  ADDRESS_ID=$(echo "$ADDRESS_RESPONSE" | jq -r '.id // empty')
else
  echo -e "${RED}No access token available${NC}"
fi
echo ""

# Test 11: Get User Addresses (Protected)
echo -e "${BLUE}11. Testing Get User Addresses (Protected)${NC}"
if [ -n "$ACCESS_TOKEN" ]; then
  curl -s -X GET "$BASE_URL/users-address/getuseraddresses" \
    -H "Authorization: Bearer $ACCESS_TOKEN" | jq .
else
  echo -e "${RED}No access token available${NC}"
fi
echo ""

# Test 12: Update User Address (Protected)
echo -e "${BLUE}12. Testing Update User Address (Protected)${NC}"
if [ -n "$ACCESS_TOKEN" ] && [ -n "$ADDRESS_ID" ]; then
  curl -s -X PATCH "$BASE_URL/users-address/updateuseraddress/$ADDRESS_ID" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -d '{
      "street": "456 Updated St"
    }' | jq .
else
  echo -e "${RED}No access token or address ID available${NC}"
fi
echo ""

# Test 13: Get User Address by ID (Protected)
echo -e "${BLUE}13. Testing Get User Address by ID (Protected)${NC}"
if [ -n "$ACCESS_TOKEN" ] && [ -n "$ADDRESS_ID" ]; then
  curl -s -X GET "$BASE_URL/users-address/getuseraddressbyid/$ADDRESS_ID" \
    -H "Authorization: Bearer $ACCESS_TOKEN" | jq .
else
  echo -e "${RED}No access token or address ID available${NC}"
fi
echo ""

# Test 14: Sign Out (Protected)
echo -e "${BLUE}14. Testing Sign Out (Protected)${NC}"
if [ -n "$ACCESS_TOKEN" ]; then
  curl -s -X POST "$BASE_URL/auth/signout" \
    -H "Authorization: Bearer $ACCESS_TOKEN" | jq .
else
  echo -e "${RED}No access token available${NC}"
fi
echo ""

# Test 15: Delete User Address (Protected)
echo -e "${BLUE}15. Testing Delete User Address (Protected)${NC}"
if [ -n "$ACCESS_TOKEN" ] && [ -n "$ADDRESS_ID" ]; then
  curl -s -X DELETE "$BASE_URL/users-address/deleteuseraddress/$ADDRESS_ID" \
    -H "Authorization: Bearer $ACCESS_TOKEN" | jq .
else
  echo -e "${RED}No access token or address ID available${NC}"
fi
echo ""

# Test 16: Delete User (Protected) - commented out to avoid deleting test user
# echo -e "${BLUE}16. Testing Delete User (Protected)${NC}"
# if [ -n "$ACCESS_TOKEN" ]; then
#   curl -s -X DELETE "$BASE_URL/users/deleteuser" \
#     -H "Authorization: Bearer $ACCESS_TOKEN" | jq .
# else
#   echo -e "${RED}No access token available${NC}"
# fi
# echo ""

echo -e "${GREEN}=========================================="
echo "All tests completed!"
echo "==========================================${NC}"
