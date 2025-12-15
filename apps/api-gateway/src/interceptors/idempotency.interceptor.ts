import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { Observable, of } from "rxjs";
import Redis from "ioredis";
import { InjectRedis } from "@nestjs-modules/ioredis";
import { tap } from 'rxjs/operators'


@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {

    constructor(
        @InjectRedis() private readonly redis: Redis
    ){}

    async intercept(context: ExecutionContext, next: CallHandler<any>): Promise<Observable<any>> {
        const request = context.switchToHttp().getRequest();

        if (!['POST', 'PATCH'].includes(request.method)) {
            return next.handle();
        }

        const idempotencyKey = request.headers['idempotency-key'];

        if (!idempotencyKey) {
            return next.handle();
        }

        const cacheKey = `idempotency:${idempotencyKey}`

        const cached = await this.redis.get(cacheKey);
        if (cached) {
            return of(JSON.parse(cached));
        }

        return next.handle().pipe(
            tap(async(data)=>{
                await this.redis.set(
                    cacheKey,
                    JSON.stringify(data),
                    'EX',
                    86400
                )
            })
        )
    }
}