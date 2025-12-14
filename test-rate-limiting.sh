#!/bin/bash

# Test Rate Limiting - Should allow 10 requests per 60 seconds, then return 429

echo "=========================================="
echo "Testing Rate Limiting (10 req/60s)"
echo "=========================================="
echo ""

API_URL="http://localhost:3000/product/getproducts"

echo "Sending 15 rapid requests to test rate limiting..."
echo ""

for i in {1..15}
do
  response=$(curl -s -w "\n%{http_code}" "$API_URL")
  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | sed '$d')
  
  if [ "$http_code" == "429" ]; then
    echo "Request $i: ⛔ RATE LIMITED (HTTP 429) - Rate limiter is working!"
  elif [ "$http_code" == "200" ]; then
    echo "Request $i: ✅ SUCCESS (HTTP 200)"
  else
    echo "Request $i: ⚠️  HTTP $http_code"
  fi
  
  # Small delay to see the output clearly
  sleep 0.1
done

echo ""
echo "=========================================="
echo "Rate Limiting Test Complete!"
echo "Expected: First 10 requests succeed, rest get 429"
echo "=========================================="
