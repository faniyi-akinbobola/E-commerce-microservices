# Auth Service Docker Setup - Complete ✅

## 🎉 Status: RUNNING SUCCESSFULLY

Your Auth microservice is now fully operational in Docker with:

- ✅ PostgreSQL database connected
- ✅ RabbitMQ message broker connected
- ✅ TypeORM migrations configured and running
- ✅ All dependencies properly injected
- ✅ Environment variables loaded correctly

## 📦 Running Services

```bash
docker ps --format "table {{.Names}}\t{{.Status}}"
```

| Container                | Status         |
| ------------------------ | -------------- |
| ecommerce-auth-service-1 | Up and running |
| ecommerce-auth-db-1      | Up and running |
| ecommerce-rabbitmq-1     | Up and running |

## 🔧 What Was Fixed

### 1. Crypto Module Error

**Problem:** `ReferenceError: crypto is not defined`  
**Solution:** Created `polyfill.js` to make Node.js crypto available globally

```javascript
// apps/auth/polyfill.js
globalThis.crypto = require('crypto');
```

### 2. Dependency Injection Issues

**Problem:** NestJS couldn't resolve dependencies  
**Solutions:**

- Added `exports: [UsersService]` to `UsersModule`
- Added `User` entity to `UsersAddressModule` imports

### 3. RabbitMQ Connection

**Problem:** Service trying to connect to localhost instead of rabbitmq container  
**Solutions:**

- Fixed environment variable name: `RabbitMQ_URL` → `RABBITMQ_URL`
- Added manual .env file loading in `main.ts`

### 4. Database Migrations

**Problem:** TypeORM couldn't find DataSource configuration  
**Solutions:**

- Created `data-source.ts` with proper .env loading
- Fixed .env path to use `process.cwd()` instead of relative path
- Updated migration command: `npx typeorm migration:run -d dist/apps/auth/src/database/data-source.js`

## 📁 Key Files

### Dockerfile (`apps/auth/Dockerfile`)

```dockerfile
# Multi-stage build optimized for NestJS monorepo
FROM node:18-alpine AS base
WORKDIR /usr/src/app
COPY package*.json ./
COPY nest-cli.json ./
COPY tsconfig*.json ./
COPY apps/auth/package*.json ./apps/auth/
RUN npm ci --legacy-peer-deps

FROM base AS build
WORKDIR /usr/src/app
COPY . .
RUN npm run build auth

FROM node:18-alpine AS production
WORKDIR /usr/src/app/apps/auth
COPY package*.json ./
RUN npm ci --legacy-peer-deps --omit=dev
COPY --from=build /usr/src/app/dist/apps/auth ./dist
COPY --from=build /usr/src/app/apps/auth/.env .env
COPY --from=build /usr/src/app/apps/auth/polyfill.js ./polyfill.js
COPY --from=build /usr/src/app/apps/auth/run-migrations.sh ./run-migrations.sh
RUN chmod +x ./run-migrations.sh

CMD ["./run-migrations.sh"]
```

### Entry Point (`apps/auth/run-migrations.sh`)

```bash
#!/bin/sh
# Run TypeORM migrations
npx typeorm migration:run -d dist/apps/auth/src/database/data-source.js
# Start the app
node -r ./polyfill.js dist/apps/auth/src/main.js
```

### Environment Variables (`apps/auth/.env`)

```env
# Database
DB_HOST=auth-db
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=auth_db

# JWT
JWT_SECRET=supersecretjwt
REFRESH_SECRET=supersecretrefresh

# RabbitMQ
RABBITMQ_URL=amqp://rabbitmq:5672
QUEUES__NOTIFICATIONS_QUEUE=notifications_queue

# Other
FRONTEND_URL=http://localhost:3000
```

## 🧪 Testing the Service

Your Auth service exposes these RabbitMQ message patterns:

### Authentication Endpoints

- `{ cmd: 'signup' }` - User registration
- `{ cmd: 'login' }` - User login
- `{ cmd: 'changePassword' }` - Change user password
- `{ cmd: 'forgotPassword' }` - Request password reset
- `{ cmd: 'resetPassword' }` - Reset password with token
- `{ cmd: 'getProfile' }` - Get user profile
- `{ cmd: 'refreshTokens' }` - Refresh JWT tokens

### User Management

- `{ cmd: 'get_users' }` - Get all users
- `{ cmd: 'get_user_by_id' }` - Get user by ID
- `{ cmd: 'update_user' }` - Update user
- `{ cmd: 'delete_user' }` - Delete user

### Address Management

- `{ cmd: 'create_user_address' }` - Create user address
- `{ cmd: 'get_user_addresses' }` - Get user addresses
- `{ cmd: 'update_user_address' }` - Update address
- `{ cmd: 'delete_user_address' }` - Delete address
- `{ cmd: 'get_user_address_by_id' }` - Get address by ID

### Testing with API Gateway

To test these endpoints, you'll need to:

1. Build and run your API Gateway service
2. API Gateway will proxy HTTP requests to RabbitMQ messages
3. Auth service will respond via RabbitMQ

Example test flow:

```
Client → HTTP POST /auth/signup → API Gateway → RabbitMQ → Auth Service
Auth Service → RabbitMQ → API Gateway → HTTP Response → Client
```

## 🗄️ Database Status

Currently created tables:

- ✅ `migrations` - TypeORM migrations tracking table

**Note:** No migration files exist yet. You have two options:

### Option 1: Enable Auto-Sync (Development Only)

```typescript
// In database.module.ts
synchronize: true; // TypeORM will auto-create tables from entities
```

### Option 2: Create Migration Files (Recommended for Production)

```bash
# Generate migration from entities
npx typeorm migration:generate apps/auth/src/migrations/InitialSchema -d apps/auth/src/database/data-source.ts

# Run migrations
docker-compose restart auth-service
```

## 🚀 Useful Commands

### View Logs

```bash
docker logs ecommerce-auth-service-1 --tail 50 -f
docker logs ecommerce-rabbitmq-1 --tail 50
docker logs ecommerce-auth-db-1 --tail 50
```

### Restart Services

```bash
docker-compose restart auth-service
docker-compose down && docker-compose up -d
docker-compose up --build -d  # Rebuild and restart
```

### Database Operations

```bash
# Connect to PostgreSQL
docker exec -it ecommerce-auth-db-1 psql -U postgres -d auth_db

# View tables
docker exec ecommerce-auth-db-1 psql -U postgres -d auth_db -c "\dt"

# View users (once table is created)
docker exec ecommerce-auth-db-1 psql -U postgres -d auth_db -c "SELECT * FROM users;"
```

### RabbitMQ Management

- URL: http://localhost:15672
- Username: `guest`
- Password: `guest`

View queues, exchanges, and message flow in the web UI.

## 📋 Next Steps

1. **Create Migrations** (Optional but Recommended)

   ```bash
   # Generate initial migration
   npx typeorm migration:generate apps/auth/src/migrations/InitialSchema -d apps/auth/src/database/data-source.ts
   ```

2. **Build API Gateway**
   - Set up similar Docker configuration
   - Connect to same RabbitMQ instance
   - Proxy HTTP requests to Auth service

3. **Test Integration**
   - Use Postman or curl to test via API Gateway
   - Verify signup, login, and user management
   - Check database for created users

4. **Add More Services**
   - Cart service
   - Inventory service
   - Follow same Docker setup pattern

## 🎯 Success Metrics

Your setup is complete when you see:

- ✅ "Nest microservice successfully started" in logs
- ✅ No connection errors to RabbitMQ
- ✅ No connection errors to PostgreSQL
- ✅ Migrations run successfully (or "No migrations are pending")
- ✅ All three containers running (docker ps)

## 🐛 Troubleshooting

### Service Won't Start

```bash
# Check logs
docker logs ecommerce-auth-service-1

# Rebuild from scratch
docker-compose down -v
docker-compose up --build
```

### Database Connection Issues

```bash
# Verify database is running
docker ps | grep auth-db

# Test connection
docker exec ecommerce-auth-db-1 psql -U postgres -c "SELECT 1;"
```

### RabbitMQ Connection Issues

```bash
# Check RabbitMQ is running
docker ps | grep rabbitmq

# View RabbitMQ logs
docker logs ecommerce-rabbitmq-1
```

## 📚 Resources

- [NestJS Microservices](https://docs.nestjs.com/microservices/basics)
- [TypeORM Migrations](https://typeorm.io/migrations)
- [Docker Compose](https://docs.docker.com/compose/)
- [RabbitMQ](https://www.rabbitmq.com/documentation.html)

---

**Status:** ✅ All systems operational!  
**Last Updated:** December 5, 2025  
**Next:** Build API Gateway or create database migrations
