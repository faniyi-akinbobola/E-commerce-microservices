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
var UsersAddressController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersAddressController = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const common_2 = require("@nestjs/common");
const common_3 = require("../../../../libs/common/src");
const jwt_blacklist_guard_1 = require("../guards/jwt-blacklist.guard");
const common_4 = require("../../../../libs/common/src");
const rxjs_1 = require("rxjs");
let UsersAddressController = UsersAddressController_1 = class UsersAddressController {
    constructor(authClient, circuitBreakerService) {
        this.authClient = authClient;
        this.circuitBreakerService = circuitBreakerService;
        this.logger = new common_1.Logger(UsersAddressController_1.name);
    }
    async onModuleInit() {
        this.initializeCircuitBreakers();
    }
    initializeCircuitBreakers() {
        this.createUserAddressCircuit = this.circuitBreakerService.createCircuitBreaker(async (data) => {
            return await (0, rxjs_1.lastValueFrom)(this.authClient.send({ cmd: "create_user_address" }, data).pipe((0, rxjs_1.timeout)(10000)));
        }, {
            timeout: 10000,
            errorThresholdPercentage: 50,
            resetTimeout: 3000,
            name: "create_user_address"
        });
        this.createUserAddressCircuit.fallback(() => {
            throw new common_1.ServiceUnavailableException(`Create user address failed. Please try again later.`);
        });
        this.getUserAddressesCircuit = this.circuitBreakerService.createCircuitBreaker(async () => {
            return await (0, rxjs_1.lastValueFrom)(this.authClient.send({ cmd: "get_user_addresses" }, {}).pipe((0, rxjs_1.timeout)(5000)));
        }, {
            timeout: 5000,
            errorThresholdPercentage: 50,
            resetTimeout: 3000,
            name: "get_user_addresses"
        });
        this.getUserAddressesCircuit.fallback(() => {
            throw new common_1.ServiceUnavailableException(`Get user addresses failed. Please try again later.`);
        });
        this.updateUserAddressCircuit = this.circuitBreakerService.createCircuitBreaker(async (data) => {
            return await (0, rxjs_1.lastValueFrom)(this.authClient.send({ cmd: "update_user_address" }, data).pipe((0, rxjs_1.timeout)(10000)));
        }, {
            timeout: 10000,
            errorThresholdPercentage: 50,
            resetTimeout: 3000,
            name: "update_user_address"
        });
        this.updateUserAddressCircuit.fallback(() => {
            throw new common_1.ServiceUnavailableException(`Update user address failed. Please try again later.`);
        });
        this.deleteUserAddressCircuit = this.circuitBreakerService.createCircuitBreaker(async (id) => {
            return await (0, rxjs_1.lastValueFrom)(this.authClient.send({ cmd: "delete_user_address" }, { id }).pipe((0, rxjs_1.timeout)(5000)));
        }, {
            timeout: 5000,
            errorThresholdPercentage: 50,
            resetTimeout: 3000,
            name: "delete_user_address"
        });
        this.deleteUserAddressCircuit.fallback(() => {
            throw new common_1.ServiceUnavailableException(`Delete user address service failed. Please try again later.`);
        });
        this.getUserAddressByIdCircuit = this.circuitBreakerService.createCircuitBreaker(async (id) => {
            return await (0, rxjs_1.lastValueFrom)(this.authClient.send({ cmd: "get_user_address_by_id" }, { id }).pipe((0, rxjs_1.timeout)(5000)));
        }, {
            timeout: 5000,
            errorThresholdPercentage: 50,
            resetTimeout: 3000,
            name: "get_user_address_by_id"
        });
        this.getUserAddressByIdCircuit.fallback(() => {
            throw new common_1.ServiceUnavailableException(`Get user address by id failed. Please try again later.`);
        });
    }
    async createUserAddress(createUserAddressDto, req) {
        try {
            return await this.createUserAddressCircuit.fire(Object.assign({ userId: req.user.id }, createUserAddressDto));
        }
        catch (error) {
            this.logger.error(`create user failed: ${error}`);
            throw error;
        }
    }
    async getUserAddresses(req) {
        try {
            return await this.getUserAddressesCircuit.fire({
                userId: req.user.id,
            });
        }
        catch (error) {
            this.logger.error(`get user addresses failed: ${error}`);
            throw error;
        }
    }
    async updateUserAddress(id, updateUserAddressDto, req) {
        try {
            return await this.updateUserAddressCircuit.fire(Object.assign({ userId: req.user.id, id }, updateUserAddressDto));
        }
        catch (error) {
            this.logger.error(`Update user address failed: ${error}`);
            throw error;
        }
    }
    async deleteUserAddress(id, req) {
        try {
            return await this.deleteUserAddressCircuit.fire({
                userId: req.user.id,
                id
            });
        }
        catch (error) {
            this.logger.error(`delete user address failed: ${error}`);
            throw error;
        }
    }
    async getUserAddressById(id, req) {
        try {
            return await this.getUserAddressByIdCircuit.fire({
                userId: req.user.id,
                id
            });
        }
        catch (error) {
            this.logger.error(`Get user address by id failed: ${error}`);
            throw error;
        }
    }
};
exports.UsersAddressController = UsersAddressController;
__decorate([
    (0, common_3.Roles)('ADMIN', 'CUSTOMER'),
    (0, common_1.Post)('createuseraddress'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [common_3.CreateUserAddressDto, Object]),
    __metadata("design:returntype", Promise)
], UsersAddressController.prototype, "createUserAddress", null);
__decorate([
    (0, common_3.Roles)('ADMIN', 'CUSTOMER'),
    (0, common_1.Get)('getuseraddresses'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersAddressController.prototype, "getUserAddresses", null);
__decorate([
    (0, common_3.Roles)('ADMIN', 'CUSTOMER'),
    (0, common_1.Patch)('updateuseraddress/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, common_3.UpdateUserAddressDto, Object]),
    __metadata("design:returntype", Promise)
], UsersAddressController.prototype, "updateUserAddress", null);
__decorate([
    (0, common_3.Roles)('ADMIN', 'CUSTOMER'),
    (0, common_1.Delete)('deleteuseraddress/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UsersAddressController.prototype, "deleteUserAddress", null);
__decorate([
    (0, common_3.Roles)('ADMIN', 'CUSTOMER'),
    (0, common_1.Get)('getuseraddressbyid/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UsersAddressController.prototype, "getUserAddressById", null);
exports.UsersAddressController = UsersAddressController = UsersAddressController_1 = __decorate([
    (0, common_1.UseGuards)(jwt_blacklist_guard_1.JwtBlacklistGuard),
    (0, common_1.Controller)('users-address'),
    __param(0, (0, common_2.Inject)('AUTH_SERVICE')),
    __metadata("design:paramtypes", [microservices_1.ClientProxy,
        common_4.CircuitBreakerService])
], UsersAddressController);
//# sourceMappingURL=users-address.controller.js.map