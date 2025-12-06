# Docker Build & Run Fix for Notifications Service

## Problem

- Container failed to start: `Cannot find module '/usr/src/app/dist/apps/notifications/main.js'`
- Environment variables not loaded, causing connection errors
- Dependency injection errors for unused providers

## Solution Steps

### 1. Multi-Stage Dockerfile

Use a multi-stage Dockerfile to build and copy the correct output files:

```dockerfile
# ---------- BASE ----------
FROM node:18-alpine AS base
WORKDIR /usr/src/app
COPY package*.json ./
COPY nest-cli.json ./
COPY tsconfig*.json ./
COPY apps/notifications/package*.json ./apps/notifications/
RUN npm ci --legacy-peer-deps

# ---------- BUILD ----------
FROM base AS build
WORKDIR /usr/src/app
COPY . .
RUN npm run build notifications

# ---------- PRODUCTION ----------
FROM node:18-alpine AS production
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --legacy-peer-deps --omit=dev
COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/apps/notifications/.env ./apps/notifications/.env
CMD ["node", "dist/apps/notifications/apps/notifications/src/main.js"]
```

### 2. Entry File Path

- The build output is nested: `dist/apps/notifications/apps/notifications/src/main.js`
- Update Docker CMD to match this path.

### 3. Environment Variables

- Use `ConfigModule.forRoot` in your NestJS module:

```typescript
import { ConfigModule } from '@nestjs/config';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/notifications/.env',
    }),
    // ...
  ],
})
```

- Ensure variable names match between `.env` and code.

### 4. Remove Unused Providers

- Remove unused or unregistered providers from your service/module.

### 5. Rebuild Without Cache

- Use `docker-compose build --no-cache notifications-service` to force a clean build.

## Troubleshooting Checklist

- [x] Build output path matches Docker CMD
- [x] .env file is loaded with ConfigModule
- [x] Environment variable names are correct
- [x] No unused providers in service/module
- [x] Rebuild without cache if changes are not picked up

## Example Commands

```bash
docker-compose build --no-cache notifications-service
docker-compose up notifications-service
```

---

If you see `Cannot find module ...`, check the build output path and Docker CMD. If you see connection errors, check your environment variables and ConfigModule setup.
