import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ResponseMeta {
  message?: string;
  pagination?: {
    total?: number;
    page?: number;
    pageSize?: number;
  };
  [key: string]: any;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, any> {
  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<any> {
    const response = context.switchToHttp().getResponse();
    const statusCode = response.statusCode;

    return next.handle().pipe(
      map((data) => {
        let responseData: any;
        let meta: ResponseMeta = {};

        // If controller returns { data, meta }
        if (data && typeof data === 'object' && 'data' in data) {
          responseData = data.data;
          meta = { ...((data as any).meta ?? {}) }; // <-- safely default to empty object
        } else {
          responseData = data;
        }

        return {
          statusCode,
          timestamp: new Date().toISOString(),
          data: responseData,
          ...meta, // optional message, pagination, or extra metadata
        };
      }),
    );
  }
}
