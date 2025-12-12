"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestLoggerMiddleware = void 0;
const common_1 = require("@nestjs/common");
const pino_http_1 = require("pino-http");
let RequestLoggerMiddleware = class RequestLoggerMiddleware {
    constructor() {
        this.logger = (0, pino_http_1.default)({
            level: process.env.LOG_LEVEL || 'info',
            transport: process.env.NODE_ENV !== 'production'
                ? { target: 'pino-pretty' }
                : undefined,
            serializers: {
                req(req) {
                    return {
                        method: req.method,
                        url: req.url,
                        body: req.body,
                    };
                },
                res(res) {
                    return {
                        statusCode: res.statusCode,
                        contentLength: res.getHeader ? res.getHeader('content-length') : undefined,
                    };
                },
            },
        });
    }
    use(req, res, next) {
        var _a, _b;
        const startTime = Date.now();
        req.userId = (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id) !== null && _b !== void 0 ? _b : 'guest';
        this.logger(req, res);
        res.on('finish', () => {
            const duration = Date.now() - startTime;
            req.log.info({
                userId: req.userId,
                durationMs: duration,
            });
        });
        next();
    }
};
exports.RequestLoggerMiddleware = RequestLoggerMiddleware;
exports.RequestLoggerMiddleware = RequestLoggerMiddleware = __decorate([
    (0, common_1.Injectable)()
], RequestLoggerMiddleware);
//# sourceMappingURL=request-logger.middleware.js.map