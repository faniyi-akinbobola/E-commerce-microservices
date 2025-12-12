# ---------- BASE ----------
FROM node:18-alpine AS base
WORKDIR /usr/src/app
COPY package*.json ./
COPY nest-cli.json ./
COPY tsconfig*.json ./
COPY apps/order/package*.json ./apps/order/
RUN npm ci --legacy-peer-deps

# ---------- BUILD ----------
FROM base AS build
WORKDIR /usr/src/app
COPY . .
RUN npm run build order && find /usr/src/app/dist -type f

# ---------- PRODUCTION ----------
FROM node:18-alpine AS production
WORKDIR /usr/src/app/apps/order
COPY package*.json ./
RUN npm ci --legacy-peer-deps --omit=dev
COPY --from=build /usr/src/app/dist/apps/order ./dist
COPY --from=build /usr/src/app/apps/order/polyfill.js ./polyfill.js

CMD ["node", "-r", "./polyfill.js", "dist/main.js"]

