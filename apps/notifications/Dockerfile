
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
RUN npm ci --legacy-peer-deps --omit=dev && npm install pino-pretty
COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/apps/notifications/.env ./apps/notifications/.env
COPY --from=build /usr/src/app/apps/notifications/src/templates ./src/templates

CMD ["node", "dist/apps/notifications/apps/notifications/src/main.js"]

