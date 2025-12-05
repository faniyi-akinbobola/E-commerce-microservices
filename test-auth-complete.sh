#!/bin/bash

# Complete Auth Service Test Suite
# Run this after: docker-compose up --build -d

API_URL="http://localhost:3000"
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}  E-Commerce Auth Service Test Suite${NC}"
echo -e "${BLUE}======================================${NC}\n"

# Test signup
echo -e "${YELLOW}📝 Creating new user...${NC}"
curl -X POST "$API_URL/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "email": "john@example.com",
    "password": "SecurePass123!",
    "phoneNumber": "+1234567890"
  }' | jq

echo -e "\n${YELLOW}🔐 Logging in...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!"
  }')

echo "$LOGIN_RESPONSE" | jq

# Extract token
TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.accessToken')

if [ "$TOKEN" != "null" ] && [ -n "$TOKEN" ]; then
    echo -e "\n${GREEN}✓ Login successful! Token received${NC}\n"
    
    echo -e "${YELLOW}👤 Getting user profile...${NC}"
    curl -X GET "$API_URL/auth/getprofile" \
      -H "Authorization: Bearer $TOKEN" | jq
    
    echo -e "\n${YELLOW}📋 Getting all users...${NC}"
    curl -X GET "$API_URL/users/getusers" \
      -H "Authorization: Bearer $TOKEN" | jq
    
    echo -e "\n${YELLOW}🔄 Testing password reset flow...${NC}"
    curl -X POST "$API_URL/auth/forgotpassword" \
      -H "Content-Type: application/json" \
      -d '{
        "email": "john@example.com"
      }' | jq
else
    echo -e "\n${RED}✗ Login failed - no token received${NC}"
fi

echo -e "\n${BLUE}======================================${NC}"
echo -e "${GREEN}✓ Test suite completed!${NC}"
echo -e "${BLUE}======================================${NC}\n"

echo -e "Access Token for manual testing:"
echo -e "${YELLOW}$TOKEN${NC}\n"

echo -e "Example manual curl commands:"
echo -e "${BLUE}# Signup${NC}"
echo "curl -X POST $API_URL/auth/signup -H 'Content-Type: application/json' -d '{\"username\":\"user\",\"email\":\"user@test.com\",\"password\":\"Pass123!\",\"phoneNumber\":\"+1234567890\"}'"
echo -e "\n${BLUE}# Login${NC}"
echo "curl -X POST $API_URL/auth/login -H 'Content-Type: application/json' -d '{\"email\":\"john@example.com\",\"password\":\"SecurePass123!\"}'"
echo -e "\n${BLUE}# Get Profile (Protected)${NC}"
echo "curl -X GET $API_URL/auth/getprofile -H 'Authorization: Bearer YOUR_TOKEN_HERE'"
