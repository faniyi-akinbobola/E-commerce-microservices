import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import pinoHttp from 'pino-http';
import { Logger } from 'pino';

// improvements to be considered:
// TypeScript: req.log is not a standard property on Express.Request. If you want to avoid TS errors, you can extend the Request type or use (req as any).log.
// Make sure req.user is set by authentication middleware before this logger, or userId will always be 'guest'.
// If you want to log more request/response details (headers, query, etc.), add them to the serializers.



// Extend Request to include log and userId
interface RequestWithUser extends Request {
  log: Logger;
  user?: { id?: number | string };
  userId?: number | string;
}

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  private readonly logger = pinoHttp({
    level: process.env.LOG_LEVEL || 'info',
    transport:
      process.env.NODE_ENV !== 'production'
        ? { target: 'pino-pretty' }
        : undefined,
    serializers: {
      req(req: any) {
        return {
          method: req.method,
          url: req.url,
          body: req.body,
        };
      },
      res(res: any) {
        return {
          statusCode: res.statusCode,
          contentLength: res.get('content-length'),
        };
      },
    },
  });

  use(req: RequestWithUser, res: Response, next: NextFunction): void {
    const startTime = Date.now();

    // Attach user info if available
    req.userId = req.user?.id ?? 'guest';

    this.logger(req, res); // attach pino logger to req.log

    res.on('finish', () => {
      const duration = Date.now() - startTime;
      (req.log as any).info({
        userId: req.userId,
        durationMs: duration,
      });
    });

    next();
  }
}
