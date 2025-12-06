# ---------- BASE ----------
FROM node:18-alpine AS base
WORKDIR /usr/src/app
COPY package*.json ./
COPY nest-cli.json ./
COPY tsconfig*.json ./
COPY apps/api-gateway/package*.json ./apps/api-gateway/
RUN npm ci --legacy-peer-deps

# ---------- BUILD ----------
FROM base AS build
WORKDIR /usr/src/app
COPY . .
RUN npm run build api-gateway && find /usr/src/app/dist -type f

# ---------- PRODUCTION ----------
FROM node:18-alpine AS production
WORKDIR /usr/src/app/apps/api-gateway
COPY package*.json ./
RUN npm ci --legacy-peer-deps --omit=dev && npm install pino-pretty
COPY --from=build /usr/src/app/dist/apps/api-gateway ./dist
COPY --from=build /usr/src/app/apps/api-gateway/.env .env

EXPOSE 3000

CMD ["node", "dist/apps/api-gateway/src/main.js"]