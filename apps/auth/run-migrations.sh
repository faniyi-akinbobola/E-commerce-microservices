#!/bin/sh
# Run TypeORM migrations
npx typeorm migration:run -d dist/apps/auth/src/database/data-source.js
# Start the app
node -r ./polyfill.js dist/apps/auth/src/main.js

