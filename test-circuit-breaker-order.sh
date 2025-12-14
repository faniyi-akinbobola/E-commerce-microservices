#!/bin/bash

# Test Circuit Breaker with Order Service (depends on Cart Service)

echo "=========================================="
echo "Testing Circuit Breaker - Order Service"
echo "=========================================="
echo ""

# First, we need to get a valid JWT token
echo "Step 1: Getting authentication token..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"Admin123!"}')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Failed to get auth token. Using test without auth..."
  API_URL="http://localhost:3000/product/getproducts"
else
  echo "✅ Got auth token"
  API_URL="http://localhost:3000/orders"
fi

echo ""
echo "Step 2: Test normal operation (circuit closed)"
echo "----------------------------------------------"
if [ -z "$TOKEN" ]; then
  response=$(curl -s -w "\n%{http_code}" "$API_URL")
else
  response=$(curl -s -w "\n%{http_code}" "$API_URL" -H "Authorization: Bearer $TOKEN")
fi
http_code=$(echo "$response" | tail -n1)
echo "Request with cart service running: HTTP $http_code"
echo ""

echo "Step 3: Stop cart service to trigger failures"
echo "----------------------------------------------"
echo "Stopping cart-service..."
docker-compose stop cart-service
echo "✅ Cart service stopped"
echo ""

sleep 2

echo "Step 4: Send requests to trigger circuit breaker"
echo "----------------------------------------------"
echo "Sending 12 requests to trigger circuit opening..."
echo ""

for i in {1..12}
do
  start=$(date +%s%N 2>/dev/null || date +%s000000000)
  if [ -z "$TOKEN" ]; then
    response=$(curl -s -w "\n%{http_code}" "$API_URL" 2>&1)
  else
    response=$(curl -s -w "\n%{http_code}" "$API_URL" -H "Authorization: Bearer $TOKEN" 2>&1)
  fi
  end=$(date +%s%N 2>/dev/null || date +%s000000000)
  duration=$(( (end - start) / 1000000 ))
  http_code=$(echo "$response" | tail -n1)
  
  if [[ "$http_code" == "503" ]]; then
    echo "Request $i: ⛔ SERVICE UNAVAILABLE (HTTP 503) - ${duration}ms - Circuit breaker activated!"
  elif [[ "$http_code" == "500" ]]; then
    echo "Request $i: ❌ ERROR (HTTP 500) - ${duration}ms - Service failure"
  elif [[ "$http_code" == "200" ]]; then
    echo "Request $i: ✅ SUCCESS (HTTP 200) - ${duration}ms"
  else
    echo "Request $i: ⚠️  HTTP $http_code - ${duration}ms"
  fi
  
  sleep 1
done

echo ""
echo "Step 5: Circuit should be OPEN now (failing fast)"
echo "----------------------------------------------"
echo "Making 3 more requests - should fail immediately..."
echo ""

for i in {1..3}
do
  start=$(date +%s%N 2>/dev/null || date +%s000000000)
  if [ -z "$TOKEN" ]; then
    response=$(curl -s -w "\n%{http_code}" "$API_URL" 2>&1)
  else
    response=$(curl -s -w "\n%{http_code}" "$API_URL" -H "Authorization: Bearer $TOKEN" 2>&1)
  fi
  end=$(date +%s%N 2>/dev/null || date +%s000000000)
  duration=$(( (end - start) / 1000000 ))
  http_code=$(echo "$response" | tail -n1)
  
  echo "Request $i: HTTP $http_code (took ${duration}ms) - Should be fast fail"
  sleep 0.5
done

echo ""
echo "Step 6: Restart cart service"
echo "----------------------------------------------"
echo "Starting cart-service..."
docker-compose start cart-service
echo "✅ Cart service started"
echo ""

echo "Waiting 5 seconds for service to be ready..."
sleep 5

echo ""
echo "Step 7: Wait for circuit breaker reset (30 seconds)"
echo "----------------------------------------------"
echo "Waiting 30 seconds for circuit to enter half-open state..."
sleep 30
echo ""

echo "Step 8: Test recovery (circuit should close)"
echo "----------------------------------------------"
for i in {1..5}
do
  if [ -z "$TOKEN" ]; then
    response=$(curl -s -w "\n%{http_code}" "$API_URL")
  else
    response=$(curl -s -w "\n%{http_code}" "$API_URL" -H "Authorization: Bearer $TOKEN")
  fi
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
