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
var UsersController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const update_user_dto_1 = require("../../../../libs/common/src/dtos/update-user.dto");
const jwt_blacklist_guard_1 = require("../guards/jwt-blacklist.guard");
const common_2 = require("../../../../libs/common/src");
const rxjs_1 = require("rxjs");
const common_3 = require("../../../../libs/common/src");
const operators_1 = require("rxjs/operators");
let UsersController = UsersController_1 = class UsersController {
    constructor(authClient, circuitBreakerService) {
        this.authClient = authClient;
        this.circuitBreakerService = circuitBreakerService;
        this.logger = new common_1.Logger(UsersController_1.name);
    }
    async onModuleInit() {
        this.initializeCircuitBreakers();
    }
    initializeCircuitBreakers() {
        this.getUsersCircuit = this.circuitBreakerService.createCircuitBreaker(async () => {
            return await (0, rxjs_1.lastValueFrom)(this.authClient.send({ cmd: 'get_users' }, {}).pipe((0, operators_1.timeout)(5000)));
        }, {
            timeout: 5000,
            errorThresholdPercentage: 50,
            resetTimeout: 3000,
            name: "get_users"
        });
        this.getUsersCircuit.fallback(() => {
            throw new Error('Get users service is temporarily unavailable. Please try again later.');
        });
        this.getUserByIdCircuit = this.circuitBreakerService.createCircuitBreaker(async (id) => {
            return await (0, rxjs_1.lastValueFrom)(this.authClient.send({ cmd: 'get_user_by_id' }, { id }).pipe((0, operators_1.timeout)(5000)));
        }, {
            timeout: 5000,
            errorThresholdPercentage: 50,
            resetTimeout: 3000,
            name: "get_user_by_id"
        });
        this.getUserByIdCircuit.fallback(() => {
            throw new Error('Get user by ID service is temporarily unavailable. Please try again later.');
        });
        this.deleteUserCircuit = this.circuitBreakerService.createCircuitBreaker(async (data) => {
            return await (0, rxjs_1.lastValueFrom)(this.authClient.send({ cmd: 'delete_user' }, data).pipe((0, operators_1.timeout)(5000)));
        }, {
            timeout: 5000,
            errorThresholdPercentage: 50,
            resetTimeout: 3000,
            name: "delete_user"
        });
        this.deleteUserCircuit.fallback(() => {
            throw new Error('Delete user service is temporarily unavailable. Please try again later.');
        });
        this.updateUserCircuit = this.circuitBreakerService.createCircuitBreaker(async (data) => {
            return await (0, rxjs_1.lastValueFrom)(this.authClient.send({ cmd: 'update_user' }, data).pipe((0, operators_1.timeout)(5000)));
        }, {
            timeout: 5000,
            errorThresholdPercentage: 50,
            resetTimeout: 3000,
            name: "update_user"
        });
        this.updateUserCircuit.fallback(() => {
            throw new Error('Update user service is temporarily unavailable. Please try again later.');
        });
        this.deleteUserByAdminCircuit = this.circuitBreakerService.createCircuitBreaker(async (data) => {
            return await (0, rxjs_1.lastValueFrom)(this.authClient.send({ cmd: 'delete_user' }, data).pipe((0, operators_1.timeout)(10000)));
        }, {
            timeout: 10000,
            errorThresholdPercentage: 50,
            resetTimeout: 3000,
            name: "delete_user_by_admin"
        });
        this.deleteUserByAdminCircuit.fallback(() => {
            throw new Error('Delete user by admin service is temporarily unavailable. Please try again later.');
        });
    }
    async getUsers() {
        try {
            return await this.getUsersCircuit.fire();
        }
        catch (error) {
            this.logger.error(`Get users failed: ${error.message}`);
            throw error;
        }
    }
    async getUserById(id) {
        try {
            return await this.getUserByIdCircuit.fire(id);
        }
        catch (error) {
            this.logger.error(`Get user by ID failed: ${error.message}`);
            throw error;
        }
    }
    async deleteUser(req) {
        var _a;
        try {
            const jwtToken = (_a = req.headers['authorization']) === null || _a === void 0 ? void 0 : _a.replace('Bearer ', '');
            return await this.deleteUserCircuit.fire({ id: req.user.id, requesterId: req.user.id, token: jwtToken });
        }
        catch (error) {
            this.logger.error(`Delete user failed: ${error}`);
            throw error;
        }
    }
    async updateUser(updateUserDto, req) {
        try {
            return await this.updateUserCircuit.fire({ id: req.user.id, requesterId: req.user.id, updateUserDto });
        }
        catch (error) {
            this.logger.error(`Update user failed: ${error}`);
            throw error;
        }
    }
    async deleteUserByAdmin(id, req) {
        var _a;
        try {
            const jwtToken = (_a = req.headers['authorization']) === null || _a === void 0 ? void 0 : _a.replace('Bearer ', '');
            return await this.deleteUserByAdminCircuit.fire({ id, requesterId: req.user.id, token: jwtToken });
        }
        catch (error) {
            this.logger.error(`Delete user by admin failed: ${error}`);
            throw error;
        }
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_2.Roles)('ADMIN'),
    (0, common_1.Get)('getusers'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getUsers", null);
__decorate([
    (0, common_2.Roles)('ADMIN', 'CUSTOMER'),
    (0, common_1.Get)('getuser/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getUserById", null);
__decorate([
    (0, common_2.Roles)('ADMIN', 'CUSTOMER'),
    (0, common_1.Delete)('deleteuser'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "deleteUser", null);
__decorate([
    (0, common_2.Roles)('ADMIN', 'CUSTOMER'),
    (0, common_1.Patch)('updateuser'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_user_dto_1.UpdateUserDto, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateUser", null);
__decorate([
    (0, common_2.Roles)('ADMIN'),
    (0, common_1.Delete)('deleteuser/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "deleteUserByAdmin", null);
exports.UsersController = UsersController = UsersController_1 = __decorate([
    (0, common_1.UseGuards)(jwt_blacklist_guard_1.JwtBlacklistGuard),
    (0, common_1.Controller)('users'),
    __param(0, (0, common_1.Inject)('AUTH_SERVICE')),
    __metadata("design:paramtypes", [microservices_1.ClientProxy,
        common_3.CircuitBreakerService])
], UsersController);
//# sourceMappingURL=users.controller.js.map