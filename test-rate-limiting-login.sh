#!/bin/bash

# Test Rate Limiting on Login Endpoint

echo "=========================================="
echo "Testing Rate Limiting on /auth/login"
echo "=========================================="
echo ""

API_URL="http://localhost:3000/auth/login"

echo "Sending 15 rapid login requests..."
echo ""

for i in {1..15}
do
  response=$(curl -s -w "\n%{http_code}" "$API_URL" \
    -X POST \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrong"}')
  
  http_code=$(echo "$response" | tail -n1)
  
  if [ "$http_code" = "429" ]; then
    echo "Request $i: ⛔ RATE LIMITED (HTTP 429) - Rate limiter is working!"
  elif [ "$http_code" = "401" ] || [ "$http_code" = "400" ]; then
    echo "Request $i: ✅ PROCESSED (HTTP $http_code - auth failed as expected)"
  else
    echo "Request $i: HTTP $http_code"
  fi
  
  sleep 0.1
done

echo ""
echo "=========================================="
echo "Expected: First 10 requests processed, rest get 429"
echo "=========================================="
