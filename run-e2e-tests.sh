#!/bin/bash

# API Gateway E2E Test Runner
# This script runs the e2e tests with proper service checks

set -e

echo "🚀 API Gateway E2E Test Runner"
echo "================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if docker-compose is running
echo "📋 Checking if services are running..."
if ! docker-compose ps | grep -q "Up"; then
    echo -e "${RED}❌ Services are not running!${NC}"
    echo "Please start services with: docker-compose up -d"
    exit 1
fi

echo -e "${GREEN}✅ Services are running${NC}"
echo ""

# Check if specific services are healthy
echo "🏥 Checking service health..."

services=("api-gateway" "auth-service" "product-service" "cart-service" "order-service" "payment-service")
all_healthy=true

for service in "${services[@]}"; do
    if docker-compose ps | grep "$service" | grep -q "Up"; then
        echo -e "${GREEN}✓${NC} $service is up"
    else
        echo -e "${RED}✗${NC} $service is not running"
        all_healthy=false
    fi
done

if [ "$all_healthy" = false ]; then
    echo -e "${RED}❌ Not all services are healthy!${NC}"
    echo "Please check service logs: docker-compose logs [service-name]"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ All services are healthy${NC}"
echo ""

# Wait a bit for services to stabilize
echo "⏳ Waiting for services to stabilize (5 seconds)..."
sleep 5

# Run the tests
echo "🧪 Running E2E tests..."
echo ""

if npm run test:e2e:gateway; then
    echo ""
    echo -e "${GREEN}✅ All E2E tests passed!${NC}"
    exit 0
else
    echo ""
    echo -e "${RED}❌ Some E2E tests failed!${NC}"
    echo "Check the output above for details"
    echo "You can also check service logs: docker-compose logs [service-name]"
    exit 1
fi
