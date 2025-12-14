#!/bin/bash

# Test Circuit Breaker - Simulate a service failure and watch circuit breaker open

echo "=========================================="
echo "Testing Circuit Breaker"
echo "=========================================="
echo ""

# This test requires stopping a service to trigger circuit breaker
# We'll test by stopping the product service and making requests

API_URL="http://localhost:3000/product/getproducts"

echo "Step 1: Test normal operation (circuit closed)"
echo "----------------------------------------------"
response=$(curl -s -w "\n%{http_code}" "$API_URL")
http_code=$(echo "$response" | tail -n1)
echo "Request with product service running: HTTP $http_code"
echo ""

echo "Step 2: Stop product service to trigger failures"
echo "----------------------------------------------"
echo "Run: docker-compose stop product-service"
echo ""
read -p "Press Enter after stopping product-service..."
echo ""

echo "Step 3: Send multiple requests to trigger circuit breaker"
echo "----------------------------------------------"
echo "Sending 10 requests to trigger circuit opening..."
echo ""

for i in {1..10}
do
  response=$(curl -s -w "\n%{http_code}" "$API_URL" 2>&1)
  http_code=$(echo "$response" | tail -n1)
  
  if [[ "$http_code" == "503" ]]; then
    echo "Request $i: ⛔ SERVICE UNAVAILABLE (HTTP 503) - Circuit breaker activated!"
  elif [[ "$http_code" == "500" ]]; then
    echo "Request $i: ❌ ERROR (HTTP 500) - Service failure"
  elif [[ "$http_code" == "200" ]]; then
    echo "Request $i: ✅ SUCCESS (HTTP 200)"
  else
    echo "Request $i: ⚠️  HTTP $http_code"
  fi
  
  sleep 1
done

echo ""
echo "Step 4: Circuit should be OPEN now (failing fast)"
echo "----------------------------------------------"
echo "Making a few more requests - should fail immediately..."
echo ""

for i in {1..3}
do
  start=$(date +%s%N)
  response=$(curl -s -w "\n%{http_code}" "$API_URL" 2>&1)
  end=$(date +%s%N)
  duration=$(( (end - start) / 1000000 ))
  http_code=$(echo "$response" | tail -n1)
  
  echo "Request $i: HTTP $http_code (took ${duration}ms) - Should be fast fail"
  sleep 0.5
done

echo ""
echo "Step 5: Restart product service"
echo "----------------------------------------------"
echo "Run: docker-compose start product-service"
echo ""
read -p "Press Enter after starting product-service..."
echo ""

echo "Step 6: Wait for circuit breaker reset (30 seconds)"
echo "----------------------------------------------"
echo "Waiting 30 seconds for circuit to enter half-open state..."
sleep 30
echo ""

echo "Step 7: Test recovery (circuit should close)"
echo "----------------------------------------------"
for i in {1..5}
do
  response=$(curl -s -w "\n%{http_code}" "$API_URL")
  http_code=$(echo "$response" | tail -n1)
  
  if [ "$http_code" == "200" ]; then
    echo "Request $i: ✅ SUCCESS (HTTP 200) - Circuit breaker closed!"
  else
    echo "Request $i: HTTP $http_code"
  fi
  
  sleep 1
done

echo ""
echo "=========================================="
echo "Circuit Breaker Test Complete!"
echo "Expected behavior:"
echo "1. Normal requests succeed"
echo "2. After service stops, circuit opens (fast fail)"
echo "3. After service restarts, circuit closes (recovery)"
echo "=========================================="
