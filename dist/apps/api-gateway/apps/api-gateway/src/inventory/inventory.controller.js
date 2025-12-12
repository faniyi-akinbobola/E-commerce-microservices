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
exports.InventoryController = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const jwt_blacklist_guard_1 = require("../guards/jwt-blacklist.guard");
const common_2 = require("../../../../libs/common/src");
let InventoryController = class InventoryController {
    constructor(inventoryClient) {
        this.inventoryClient = inventoryClient;
    }
    reduceStock(body) {
        return this.inventoryClient.send({ cmd: 'reduce_stock' }, body);
    }
    releaseStock(body) {
        return this.inventoryClient.send({ cmd: 'release_stock' }, body);
    }
    reserveStock(body) {
        return this.inventoryClient.send({ cmd: 'reserve_stock' }, body);
    }
    addStock(body) {
        return this.inventoryClient.send({ cmd: 'add_stock' }, body);
    }
    getAvailableProducts() {
        return this.inventoryClient.send({ cmd: 'get_available_products' }, {});
    }
    getInventoryForProduct(id) {
        return this.inventoryClient.send({ cmd: 'get_inventory_for_product' }, { id });
    }
    createInventory(body) {
        return this.inventoryClient.send({ cmd: 'create_inventory' }, body);
    }
    updateInventory(productId, body) {
        return this.inventoryClient.send({ cmd: 'update_inventory' }, Object.assign({ productId }, body));
    }
};
exports.InventoryController = InventoryController;
__decorate([
    (0, common_2.Roles)('ADMIN', 'INVENTORY_MANAGER'),
    (0, common_1.Post)('reducestock'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [common_2.ReduceStockDto]),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "reduceStock", null);
__decorate([
    (0, common_2.Roles)('ADMIN', 'INVENTORY_MANAGER'),
    (0, common_1.Post)('releasestock'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [common_2.ReleaseStockDto]),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "releaseStock", null);
__decorate([
    (0, common_2.Roles)('ADMIN', 'INVENTORY_MANAGER'),
    (0, common_1.Post)('reservestock'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [common_2.ReserveStockDto]),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "reserveStock", null);
__decorate([
    (0, common_2.Roles)('ADMIN', 'INVENTORY_MANAGER'),
    (0, common_1.Post)('addstock'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [common_2.AddStockDto]),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "addStock", null);
__decorate([
    (0, common_2.Public)(),
    (0, common_1.Get)('getavailableproducts'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "getAvailableProducts", null);
__decorate([
    (0, common_2.Public)(),
    (0, common_1.Get)('getinventoryforproduct/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "getInventoryForProduct", null);
__decorate([
    (0, common_2.Roles)('ADMIN', 'INVENTORY_MANAGER'),
    (0, common_1.Post)('createinventory'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [common_2.CreateInventoryDto]),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "createInventory", null);
__decorate([
    (0, common_2.Roles)('ADMIN', 'INVENTORY_MANAGER'),
    (0, common_1.Patch)('updateinventory/:productId'),
    __param(0, (0, common_1.Param)('productId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, common_2.UpdateInventoryDto]),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "updateInventory", null);
exports.InventoryController = InventoryController = __decorate([
    (0, common_1.UseGuards)(jwt_blacklist_guard_1.JwtBlacklistGuard),
    (0, common_1.Controller)('inventory'),
    __param(0, (0, common_1.Inject)('INVENTORY_SERVICE')),
    __metadata("design:paramtypes", [microservices_1.ClientProxy])
], InventoryController);
//# sourceMappingURL=inventory.controller.js.map