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
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const update_user_dto_1 = require("../../../../libs/common/src/dtos/update-user.dto");
const jwt_blacklist_guard_1 = require("../guards/jwt-blacklist.guard");
const common_2 = require("../../../../libs/common/src");
let UsersController = class UsersController {
    constructor(authClient) {
        this.authClient = authClient;
    }
    getUsers() {
        return this.authClient.send({ cmd: 'get_users' }, {});
    }
    getUserById(id) {
        return this.authClient.send({ cmd: 'get_user_by_id' }, { id });
    }
    deleteUser(req) {
        var _a;
        const jwtToken = (_a = req.headers['authorization']) === null || _a === void 0 ? void 0 : _a.replace('Bearer ', '');
        return this.authClient.send({ cmd: 'delete_user' }, { id: req.user.id, requesterId: req.user.id, token: jwtToken });
    }
    updateUser(updateUserDto, req) {
        return this.authClient.send({ cmd: 'update_user' }, { id: req.user.id, requesterId: req.user.id, updateUserDto });
    }
    deleteUserByAdmin(id, req) {
        var _a;
        const jwtToken = (_a = req.headers['authorization']) === null || _a === void 0 ? void 0 : _a.replace('Bearer ', '');
        return this.authClient.send({ cmd: 'delete_user' }, { id, requesterId: req.user.id, token: jwtToken });
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_2.Roles)('ADMIN'),
    (0, common_1.Get)('getusers'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "getUsers", null);
__decorate([
    (0, common_2.Roles)('ADMIN', 'CUSTOMER'),
    (0, common_1.Get)('getuser/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "getUserById", null);
__decorate([
    (0, common_2.Roles)('ADMIN', 'CUSTOMER'),
    (0, common_1.Delete)('deleteuser'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "deleteUser", null);
__decorate([
    (0, common_2.Roles)('ADMIN', 'CUSTOMER'),
    (0, common_1.Patch)('updateuser'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_user_dto_1.UpdateUserDto, Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "updateUser", null);
__decorate([
    (0, common_2.Roles)('ADMIN'),
    (0, common_1.Delete)('deleteuser/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "deleteUserByAdmin", null);
exports.UsersController = UsersController = __decorate([
    (0, common_1.UseGuards)(jwt_blacklist_guard_1.JwtBlacklistGuard),
    (0, common_1.Controller)('users'),
    __param(0, (0, common_1.Inject)('AUTH_SERVICE')),
    __metadata("design:paramtypes", [microservices_1.ClientProxy])
], UsersController);
//# sourceMappingURL=users.controller.js.map