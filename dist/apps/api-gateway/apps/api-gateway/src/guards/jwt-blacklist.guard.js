"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtBlacklistGuard = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const microservices_1 = require("@nestjs/microservices");
const rxjs_1 = require("rxjs");
const core_1 = require("@nestjs/core");
const common_2 = require("../../../../libs/common/src");
let JwtBlacklistGuard = class JwtBlacklistGuard extends (0, passport_1.AuthGuard)('jwt') {
    constructor(authClient, reflector) {
        super();
        this.authClient = authClient;
        this.reflector = reflector;
    }
    async canActivate(context) {
        var _a;
        const isPublic = this.reflector.getAllAndOverride(common_2.IS_PUBLIC_KEY, [context.getHandler(), context.getClass()]);
        if (isPublic)
            return true;
        const isValid = await super.canActivate(context);
        if (!isValid) {
            return false;
        }
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers.authorization;
        if (!authHeader) {
            throw new common_1.UnauthorizedException('No token provided');
        }
        const token = authHeader.replace('Bearer ', '');
        try {
            const result = await (0, rxjs_1.firstValueFrom)(this.authClient.send({ cmd: 'check_blacklist' }, { token }));
            if (result.isBlacklisted) {
                throw new common_1.UnauthorizedException('Token has been revoked');
            }
        }
        catch (error) {
            if (error instanceof common_1.UnauthorizedException) {
                throw error;
            }
            console.error('Blacklist check failed:', error);
        }
        try {
            const userId = (_a = request.user) === null || _a === void 0 ? void 0 : _a.id;
            if (userId) {
                const userCheck = await (0, rxjs_1.firstValueFrom)(this.authClient.send({ cmd: 'check_user_exists' }, { userId }));
                if (!userCheck.exists) {
                    throw new common_1.UnauthorizedException('User no longer exists');
                }
            }
        }
        catch (error) {
            if (error instanceof common_1.UnauthorizedException) {
                throw error;
            }
            console.error('User existence check failed:', error);
        }
        return true;
    }
};
exports.JwtBlacklistGuard = JwtBlacklistGuard;
exports.JwtBlacklistGuard = JwtBlacklistGuard = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('AUTH_SERVICE')),
    __metadata("design:paramtypes", [microservices_1.ClientProxy,
        core_1.Reflector])
], JwtBlacklistGuard);
//# sourceMappingURL=jwt-blacklist.guard.js.map