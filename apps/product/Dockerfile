# ---------- BASE ----------
FROM node:18-alpine AS base
WORKDIR /usr/src/app
COPY package*.json ./
COPY nest-cli.json ./
COPY tsconfig*.json ./
COPY apps/product/package*.json ./apps/product/
RUN npm ci --legacy-peer-deps

# ---------- BUILD ----------
FROM base AS build
WORKDIR /usr/src/app
COPY . .
RUN npm run build product && find /usr/src/app/dist -type f

# ---------- PRODUCTION ----------
FROM node:18-alpine AS production
WORKDIR /usr/src/app/apps/product
COPY package*.json ./
RUN npm ci --legacy-peer-deps --omit=dev
COPY --from=build /usr/src/app/dist/apps/product ./dist
COPY --from=build /usr/src/app/apps/product/polyfill.js ./polyfill.js

CMD ["node", "-r", "./polyfill.js", "dist/main.js"]
