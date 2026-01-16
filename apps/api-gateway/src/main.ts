import { NestFactory } from '@nestjs/core';
import { ApiGatewayModule } from './api-gateway.module';
import * as fs from 'fs';
import * as path from 'path';
import * as cookieParser from 'cookie-parser';
import { RequestLoggerMiddleware } from '@apps/common';
import { ValidationPipe, VersioningType } from '@nestjs/common';

// Load .env file manually
const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf8');
  envFile.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      const value = valueParts.join('=');
      if (key && value) {
        process.env[key.trim()] = value.trim();
      }
    }
  });
}

async function bootstrap() {
  const app = await NestFactory.create(ApiGatewayModule);

  // Enable API versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // Enable global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Enable CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  });

  const port = process.env.PORT || 3000;

  // Apply request logger middleware
  const requestLogger = new RequestLoggerMiddleware();
  app.use((req, res, next) => requestLogger.use(req, res, next));

  await app.listen(port);
  console.log(`API Gateway is running on: http://localhost:${port}`);
}
bootstrap();
