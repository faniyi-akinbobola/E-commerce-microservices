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
exports.UsersAddressController = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const common_2 = require("@nestjs/common");
const common_3 = require("../../../../libs/common/src");
const jwt_blacklist_guard_1 = require("../guards/jwt-blacklist.guard");
let UsersAddressController = class UsersAddressController {
    constructor(authClient) {
        this.authClient = authClient;
    }
    createUserAddress(createUserAddressDto, req) {
        return this.authClient.send({ cmd: 'create_user_address' }, Object.assign(Object.assign({}, createUserAddressDto), { userId: req.user.id }));
    }
    getUserAddresses(req) {
        return this.authClient.send({ cmd: 'get_user_addresses' }, { userId: req.user.id });
    }
    updateUserAddress(id, updateUserAddressDto, req) {
        return this.authClient.send({ cmd: 'update_user_address' }, { id, updateUserAddressDto, userId: req.user.id });
    }
    deleteUserAddress(id, req) {
        return this.authClient.send({ cmd: 'delete_user_address' }, { id, userId: req.user.id });
    }
    getUserAddressById(id, req) {
        return this.authClient.send({ cmd: 'get_user_address_by_id' }, { id, userId: req.user.id });
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
    __metadata("design:returntype", void 0)
], UsersAddressController.prototype, "createUserAddress", null);
__decorate([
    (0, common_3.Roles)('ADMIN', 'CUSTOMER'),
    (0, common_1.Get)('getuseraddresses'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UsersAddressController.prototype, "getUserAddresses", null);
__decorate([
    (0, common_3.Roles)('ADMIN', 'CUSTOMER'),
    (0, common_1.Patch)('updateuseraddress/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, common_3.UpdateUserAddressDto, Object]),
    __metadata("design:returntype", void 0)
], UsersAddressController.prototype, "updateUserAddress", null);
__decorate([
    (0, common_3.Roles)('ADMIN', 'CUSTOMER'),
    (0, common_1.Delete)('deleteuseraddress/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], UsersAddressController.prototype, "deleteUserAddress", null);
__decorate([
    (0, common_3.Roles)('ADMIN', 'CUSTOMER'),
    (0, common_1.Get)('getuseraddressbyid/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], UsersAddressController.prototype, "getUserAddressById", null);
exports.UsersAddressController = UsersAddressController = __decorate([
    (0, common_1.UseGuards)(jwt_blacklist_guard_1.JwtBlacklistGuard),
    (0, common_1.Controller)('users-address'),
    __param(0, (0, common_2.Inject)('AUTH_SERVICE')),
    __metadata("design:paramtypes", [microservices_1.ClientProxy])
], UsersAddressController);
//# sourceMappingURL=users-address.controller.js.map