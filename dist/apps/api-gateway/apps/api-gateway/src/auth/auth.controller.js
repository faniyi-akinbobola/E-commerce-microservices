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
    constructor(authClient, circuitBreakerService) {
        this.authClient = authClient;
        this.circuitBreakerService = circuitBreakerService;
        this.logger = new common_1.Logger(AuthController_1.name);
    }
    async onModuleInit() {
        const maxRetries = 10;
        let retries = 0;
        while (retries < maxRetries) {
            try {
                await this.authClient.connect();
                this.logger.log('Successfully connected to AUTH_SERVICE via RabbitMQ');
                break;
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
        this.initializeCircuitBreakers();
    }
    initializeCircuitBreakers() {
        this.loginCircuit = this.circuitBreakerService.createCircuitBreaker(async (data) => {
            return await (0, rxjs_1.firstValueFrom)(this.authClient.send({ cmd: 'login' }, data).pipe((0, rxjs_1.timeout)(5000)));
        }, {
            timeout: 5000,
            errorThresholdPercentage: 50,
            resetTimeout: 30000,
            name: 'auth_login',
        });
        this.loginCircuit.fallback(() => {
            throw new Error('Authentication service is temporarily unavailable. Please try again later.');
        });
        this.signupCircuit = this.circuitBreakerService.createCircuitBreaker(async (data) => {
            return await (0, rxjs_1.firstValueFrom)(this.authClient.send({ cmd: 'signup' }, data).pipe((0, rxjs_1.timeout)(10000)));
        }, {
            timeout: 10000,
            errorThresholdPercentage: 50,
            resetTimeout: 30000,
            name: 'auth_signup',
        });
        this.signupCircuit.fallback(() => {
            throw new Error('Signup service is temporarily unavailable. Please try again later.');
        });
        this.refreshTokenCircuit = this.circuitBreakerService.createCircuitBreaker(async (data) => {
            return await (0, rxjs_1.firstValueFrom)(this.authClient.send({ cmd: 'refreshTokens' }, data).pipe((0, rxjs_1.timeout)(5000)));
        }, {
            timeout: 5000,
            errorThresholdPercentage: 50,
            resetTimeout: 30000,
            name: 'auth_refresh_token',
        });
        this.refreshTokenCircuit.fallback(() => {
            throw new Error('Token refresh service is temporarily unavailable. Please login again.');
        });
        this.forgotPasswordCircuit = this.circuitBreakerService.createCircuitBreaker(async (data) => {
            return await (0, rxjs_1.firstValueFrom)(this.authClient.send({ cmd: 'forgotPassword' }, data).pipe((0, rxjs_1.timeout)(5000)));
        }, {
            timeout: 5000,
            errorThresholdPercentage: 50,
            resetTimeout: 30000,
            name: 'auth_forgot_password',
        });
        this.forgotPasswordCircuit.fallback(() => {
            throw new Error('Password reset service is temporarily unavailable. Please try again later.');
        });
        this.resetPasswordCircuit = this.circuitBreakerService.createCircuitBreaker(async (data) => {
            return await (0, rxjs_1.firstValueFrom)(this.authClient.send({ cmd: 'resetPassword' }, data).pipe((0, rxjs_1.timeout)(5000)));
        }, {
            timeout: 5000,
            errorThresholdPercentage: 50,
            resetTimeout: 30000,
            name: 'auth_reset_password',
        });
        this.resetPasswordCircuit.fallback(() => {
            throw new Error('Password reset service is temporarily unavailable. Please try again later.');
        });
        this.changePasswordCircuit = this.circuitBreakerService.createCircuitBreaker(async (data) => {
            return await (0, rxjs_1.firstValueFrom)(this.authClient.send({ cmd: 'changePassword' }, data).pipe((0, rxjs_1.timeout)(5000)));
        }, {
            timeout: 5000,
            errorThresholdPercentage: 50,
            resetTimeout: 30000,
            name: 'auth_change_password',
        });
        this.changePasswordCircuit.fallback(() => {
            throw new Error('Password change service is temporarily unavailable. Please try again later.');
        });
        this.signOutCircuit = this.circuitBreakerService.createCircuitBreaker(async (data) => {
            return await (0, rxjs_1.firstValueFrom)(this.authClient.send({ cmd: 'signOut' }, data).pipe((0, rxjs_1.timeout)(5000)));
        }, {
            timeout: 5000,
            errorThresholdPercentage: 50,
            resetTimeout: 30000,
            name: 'auth_sign_out',
        });
        this.signOutCircuit.fallback(() => {
            throw new Error('Sign out service is temporarily unavailable. Please try again later.');
        });
        this.getProfileCircuit = this.circuitBreakerService.createCircuitBreaker(async (data) => {
            return await (0, rxjs_1.firstValueFrom)(this.authClient.send({ cmd: 'getProfile' }, data).pipe((0, rxjs_1.timeout)(5000)));
        }, {
            timeout: 5000,
            errorThresholdPercentage: 50,
            resetTimeout: 30000,
            name: 'auth_get_profile',
        });
        this.getProfileCircuit.fallback(() => {
            throw new Error('Profile service is temporarily unavailable. Please try again later.');
        });
        this.logger.log('All auth circuit breakers initialized');
    }
    async login(loginDto) {
        try {
            return await this.loginCircuit.fire(loginDto);
        }
        catch (error) {
            this.logger.error(`Login failed: ${error.message}`);
            throw error;
        }
    }
    async signup(body) {
        try {
            this.logger.log(`Signup request for user: ${body.username}`);
            return await this.signupCircuit.fire(body);
        }
        catch (error) {
            this.logger.error(`Signup failed: ${error.message}`, error.stack);
            throw error;
        }
    }
    async refreshToken(body) {
        try {
            return await this.refreshTokenCircuit.fire(body);
        }
        catch (error) {
            this.logger.error(`Refresh token failed: ${error.message}`);
            throw error;
        }
    }
    async forgotPassword(body) {
        try {
            return await this.forgotPasswordCircuit.fire(body);
        }
        catch (error) {
            this.logger.error(`Forgot password failed: ${error.message}`);
            throw error;
        }
    }
    async resetPassword(body) {
        try {
            return await this.resetPasswordCircuit.fire(body);
        }
        catch (error) {
            this.logger.error(`Reset password failed: ${error.message}`);
            throw error;
        }
    }
    async changePassword(body, req) {
        try {
            return await this.changePasswordCircuit.fire({
                userId: req.user.id,
                changePasswordDto: body
            });
        }
        catch (error) {
            this.logger.error(`Change password failed: ${error.message}`);
            throw error;
        }
    }
    async signOut(req) {
        var _a;
        try {
            const jwtToken = (_a = req.headers['authorization']) === null || _a === void 0 ? void 0 : _a.replace('Bearer ', '');
            return await this.signOutCircuit.fire({
                userId: req.user.id,
                token: jwtToken
            });
        }
        catch (error) {
            this.logger.error(`Sign out failed: ${error.message}`);
            throw error;
        }
    }
    async getProfile(req) {
        try {
            return await this.getProfileCircuit.fire({ userId: req.user.id });
        }
        catch (error) {
            this.logger.error(`Get profile failed: ${error.message}`);
            throw error;
        }
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [common_2.LoginDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('signup'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [common_2.CreateUserDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "signup", null);
__decorate([
    (0, common_1.Post)('refreshtoken'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [common_2.RefreshTokenDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refreshToken", null);
__decorate([
    (0, common_1.Post)('forgotpassword'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [common_2.ForgotPasswordDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "forgotPassword", null);
__decorate([
    (0, common_1.Post)('resetpassword'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [common_2.ResetPasswordDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "resetPassword", null);
__decorate([
    (0, common_3.UseGuards)(jwt_blacklist_guard_1.JwtBlacklistGuard),
    (0, common_1.Post)('changepassword'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_3.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [common_2.ChangePasswordDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "changePassword", null);
__decorate([
    (0, common_3.UseGuards)(jwt_blacklist_guard_1.JwtBlacklistGuard),
    (0, common_1.Post)('signout'),
    __param(0, (0, common_3.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "signOut", null);
__decorate([
    (0, common_3.UseGuards)(jwt_blacklist_guard_1.JwtBlacklistGuard),
    (0, common_3.Get)('getprofile'),
    __param(0, (0, common_3.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getProfile", null);
exports.AuthController = AuthController = AuthController_1 = __decorate([
    (0, common_1.Controller)('auth'),
    __param(0, (0, common_1.Inject)('AUTH_SERVICE')),
    __metadata("design:paramtypes", [microservices_1.ClientProxy,
        common_2.CircuitBreakerService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map