# Base stage
FROM node:18-alpine AS base
WORKDIR /usr/src/app
COPY package*.json ./
COPY nest-cli.json ./
COPY tsconfig*.json ./
RUN npm ci --legacy-peer-deps

# Build stage
FROM base AS build
WORKDIR /usr/src/app
COPY . .
RUN npm run build cart && \
    find /usr/src/app/dist -type f

# Production stage
FROM node:18-alpine AS production
WORKDIR /usr/src/app/apps/cart
COPY package*.json ./
RUN npm ci --legacy-peer-deps --omit=dev
COPY --from=build /usr/src/app/dist/apps/cart ./dist
COPY --from=build /usr/src/app/apps/cart/polyfill.js ./polyfill.js
CMD ["node", "polyfill.js"]