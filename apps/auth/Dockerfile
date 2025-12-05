
# ---------- BASE ----------
FROM node:18-alpine AS base
WORKDIR /usr/src/app
COPY package*.json ./
COPY nest-cli.json ./
COPY tsconfig*.json ./
COPY apps/auth/package*.json ./apps/auth/
RUN npm ci --legacy-peer-deps

# ---------- BUILD ----------
FROM base AS build
WORKDIR /usr/src/app
COPY . .
RUN npm run build auth && find /usr/src/app/dist -type f

# ---------- PRODUCTION ----------
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
