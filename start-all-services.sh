#!/bin/bash

# Start all microservices for e2e testing
# Run this in the background before running e2e tests

echo "Starting all microservices..."

# Start each service in the background
echo "Starting Auth Service on port 3001..."
npm run start:dev auth &

echo "Starting Product Service on port 3002..."
npm run start:dev product &

echo "Starting Inventory Service on port 3003..."
npm run start:dev inventory &

echo "Starting Payment Service on port 3004..."
npm run start:dev payment &

echo "Starting Cart Service on port 3005..."
npm run start:dev cart &

echo "Starting Order Service on port 3006..."
npm run start:dev order &

echo "Starting Notifications Service on port 3007..."
npm run start:dev notifications &

echo "Starting API Gateway on port 3000..."
npm run start:dev api-gateway &

echo ""
echo "All services starting..."
echo "Wait 10-15 seconds for all services to be ready before running e2e tests."
echo ""
echo "To stop all services, run: pkill -f 'nest start'"
