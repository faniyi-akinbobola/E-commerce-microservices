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
var AuthController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const common_2 = require("../../../../libs/common/src");
const common_3 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const jwt_blacklist_guard_1 = require("../guards/jwt-blacklist.guard");
const rxjs_1 = require("rxjs");
let AuthController = AuthController_1 = class AuthController {
    constructor(authClient) {
        this.authClient = authClient;
        this.logger = new common_1.Logger(AuthController_1.name);
    }
    async onModuleInit() {
        const maxRetries = 10;
        let retries = 0;
        while (retries < maxRetries) {
            try {
                await this.authClient.connect();
                this.logger.log('Successfully connected to AUTH_SERVICE via RabbitMQ');
                return;
            }
            catch (error) {
                retries++;
                const delay = Math.min(1000 * Math.pow(2, retries), 10000);
                this.logger.warn(`Failed to connect to AUTH_SERVICE (attempt ${retries}/${maxRetries}). Retrying in ${delay}ms...`);
                if (retries >= maxRetries) {
                    this.logger.error('Failed to connect to AUTH_SERVICE after max retries', error);
                    throw error;
                }
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
    login(loginDto) {
        return this.authClient.send({ cmd: 'login' }, loginDto);
    }
    signup(body) {
        this.logger.log(`Signup request for user: ${body.username}`);
        return this.authClient.send({ cmd: 'signup' }, body).pipe((0, rxjs_1.timeout)(10000), (0, rxjs_1.catchError)(err => {
            this.logger.error(`Signup failed: ${err.message}`, err.stack);
            return (0, rxjs_1.throwError)(() => err);
        }));
    }
    refreshToken(body) {
        return this.authClient.send({ cmd: 'refreshTokens' }, body);
    }
    forgotPassword(body) {
        return this.authClient.send({ cmd: 'forgotPassword' }, body);
    }
    resetPassword(body) {
        return this.authClient.send({ cmd: 'resetPassword' }, body);
    }
    changePassword(body, req) {
        return this.authClient.send({ cmd: 'changePassword' }, { userId: req.user.id, changePasswordDto: body });
    }
    signOut(req) {
        var _a;
        const jwtToken = (_a = req.headers['authorization']) === null || _a === void 0 ? void 0 : _a.replace('Bearer ', '');
        return this.authClient.send({ cmd: 'signOut' }, { userId: req.user.id, token: jwtToken });
    }
    getProfile(req) {
        return this.authClient.send({ cmd: 'getProfile' }, { userId: req.user.id });
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [common_2.LoginDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('signup'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [common_2.CreateUserDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "signup", null);
__decorate([
    (0, common_1.Post)('refreshtoken'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [common_2.RefreshTokenDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "refreshToken", null);
__decorate([
    (0, common_1.Post)('forgotpassword'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [common_2.ForgotPasswordDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "forgotPassword", null);
__decorate([
    (0, common_1.Post)('resetpassword'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [common_2.ResetPasswordDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "resetPassword", null);
__decorate([
    (0, common_3.UseGuards)(jwt_blacklist_guard_1.JwtBlacklistGuard),
    (0, common_1.Post)('changepassword'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_3.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [common_2.ChangePasswordDto, Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "changePassword", null);
__decorate([
    (0, common_3.UseGuards)(jwt_blacklist_guard_1.JwtBlacklistGuard),
    (0, common_1.Post)('signout'),
    __param(0, (0, common_3.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "signOut", null);
__decorate([
    (0, common_3.UseGuards)(jwt_blacklist_guard_1.JwtBlacklistGuard),
    (0, common_3.Get)('getprofile'),
    __param(0, (0, common_3.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "getProfile", null);
exports.AuthController = AuthController = AuthController_1 = __decorate([
    (0, common_1.Controller)('auth'),
    __param(0, (0, common_1.Inject)('AUTH_SERVICE')),
    __metadata("design:paramtypes", [microservices_1.ClientProxy])
], AuthController);
//# sourceMappingURL=auth.controller.js.map