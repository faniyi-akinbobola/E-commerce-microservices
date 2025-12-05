#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

API_URL="http://localhost:3000"

echo -e "${YELLOW}=== Testing Auth Service via API Gateway ===${NC}\n"

# Test 1: Signup
echo -e "${YELLOW}Test 1: User Signup${NC}"
SIGNUP_RESPONSE=$(curl -s -X POST "$API_URL/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "Password123!",
    "phoneNumber": "+1234567890"
  }')

echo "Response: $SIGNUP_RESPONSE"

if echo "$SIGNUP_RESPONSE" | grep -q "accessToken"; then
    echo -e "${GREEN}✓ Signup successful${NC}\n"
    ACCESS_TOKEN=$(echo $SIGNUP_RESPONSE | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
else
    echo -e "${RED}✗ Signup failed${NC}\n"
fi

# Test 2: Login
echo -e "${YELLOW}Test 2: User Login${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123!"
  }')

echo "Response: $LOGIN_RESPONSE"

if echo "$LOGIN_RESPONSE" | grep -q "accessToken"; then
    echo -e "${GREEN}✓ Login successful${NC}\n"
    ACCESS_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
else
    echo -e "${RED}✗ Login failed${NC}\n"
fi

# Test 3: Get Profile (Protected Route)
if [ ! -z "$ACCESS_TOKEN" ]; then
    echo -e "${YELLOW}Test 3: Get User Profile (Protected)${NC}"
    PROFILE_RESPONSE=$(curl -s -X GET "$API_URL/auth/getprofile" \
      -H "Authorization: Bearer $ACCESS_TOKEN")
    
    echo "Response: $PROFILE_RESPONSE"
    
    if echo "$PROFILE_RESPONSE" | grep -q "email"; then
        echo -e "${GREEN}✓ Get profile successful${NC}\n"
    else
        echo -e "${RED}✗ Get profile failed${NC}\n"
    fi
else
    echo -e "${RED}✗ Skipping profile test - no access token${NC}\n"
fi

# Test 4: Get All Users (Protected Route)
if [ ! -z "$ACCESS_TOKEN" ]; then
    echo -e "${YELLOW}Test 4: Get All Users (Protected)${NC}"
    USERS_RESPONSE=$(curl -s -X GET "$API_URL/users/getusers" \
      -H "Authorization: Bearer $ACCESS_TOKEN")
    
    echo "Response: $USERS_RESPONSE"
    
    if echo "$USERS_RESPONSE" | grep -q "\["; then
        echo -e "${GREEN}✓ Get users successful${NC}\n"
    else
        echo -e "${RED}✗ Get users failed${NC}\n"
    fi
else
    echo -e "${RED}✗ Skipping users test - no access token${NC}\n"
fi

# Test 5: Forgot Password
echo -e "${YELLOW}Test 5: Forgot Password${NC}"
FORGOT_RESPONSE=$(curl -s -X POST "$API_URL/auth/forgotpassword" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com"
  }')

echo "Response: $FORGOT_RESPONSE"

if echo "$FORGOT_RESPONSE" | grep -q "message\|sent\|success"; then
    echo -e "${GREEN}✓ Forgot password request successful${NC}\n"
else
    echo -e "${YELLOW}⚠ Forgot password response: check logs${NC}\n"
fi

# Test 6: Health Check
echo -e "${YELLOW}Test 6: API Gateway Health Check${NC}"
HEALTH_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL")

if [ "$HEALTH_RESPONSE" -eq 200 ] || [ "$HEALTH_RESPONSE" -eq 404 ]; then
    echo -e "${GREEN}✓ API Gateway is responding (HTTP $HEALTH_RESPONSE)${NC}\n"
else
    echo -e "${RED}✗ API Gateway not responding properly (HTTP $HEALTH_RESPONSE)${NC}\n"
fi

echo -e "${YELLOW}=== Test Summary ===${NC}"
echo "Access Token: ${ACCESS_TOKEN:0:50}..."
echo -e "\nTo test manually with curl:"
echo "curl -X POST $API_URL/auth/signup -H 'Content-Type: application/json' -d '{\"username\":\"user\",\"email\":\"user@test.com\",\"password\":\"Pass123!\",\"phoneNumber\":\"+1234567890\"}'"
echo ""
echo "curl -X POST $API_URL/auth/login -H 'Content-Type: application/json' -d '{\"email\":\"test@example.com\",\"password\":\"Password123!\"}'"
