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
var InventoryController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryController = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const jwt_blacklist_guard_1 = require("../guards/jwt-blacklist.guard");
const common_2 = require("../../../../libs/common/src");
const rxjs_1 = require("rxjs");
const common_3 = require("../../../../libs/common/src");
let InventoryController = InventoryController_1 = class InventoryController {
    constructor(inventoryClient, circuitBreakerService) {
        this.inventoryClient = inventoryClient;
        this.circuitBreakerService = circuitBreakerService;
        this.logger = new common_1.Logger(InventoryController_1.name);
    }
    async onModuleInit() {
        this.initializeCircuitBreakers();
    }
    initializeCircuitBreakers() {
        this.reduceStockCircuit = this.circuitBreakerService.createCircuitBreaker(async (data) => {
            return await (0, rxjs_1.lastValueFrom)(this.inventoryClient.send({ cmd: 'reduce_stock' }, data).pipe((0, rxjs_1.timeout)(10000)));
        }, {
            timeout: 10000,
            errorThresholdPercentage: 50,
            resetTimeout: 30000,
            name: 'inventory_reduce_stock',
        });
        this.reduceStockCircuit.fallback(() => {
            throw new common_1.ServiceUnavailableException('Reduce stock service is temporarily unavailable. Please try again later.');
        });
        this.releaseStockCircuit = this.circuitBreakerService.createCircuitBreaker(async (data) => {
            return await (0, rxjs_1.lastValueFrom)(this.inventoryClient.send({ cmd: 'release_stock' }, data).pipe((0, rxjs_1.timeout)(10000)));
        }, {
            timeout: 10000,
            errorThresholdPercentage: 50,
            resetTimeout: 30000,
            name: 'inventory_release_stock',
        });
        this.releaseStockCircuit.fallback(() => {
            throw new common_1.ServiceUnavailableException('Release stock service is temporarily unavailable. Please try again later.');
        });
        this.reserveStockCircuit = this.circuitBreakerService.createCircuitBreaker(async (data) => {
            return await (0, rxjs_1.lastValueFrom)(this.inventoryClient.send({ cmd: 'reserve_stock' }, data).pipe((0, rxjs_1.timeout)(10000)));
        }, {
            timeout: 10000,
            errorThresholdPercentage: 50,
            resetTimeout: 30000,
            name: 'inventory_reserve_stock',
        });
        this.reserveStockCircuit.fallback(() => {
            throw new common_1.ServiceUnavailableException('Reserve stock service is temporarily unavailable. Please try again later.');
        });
        this.addStockCircuit = this.circuitBreakerService.createCircuitBreaker(async (data) => {
            return await (0, rxjs_1.lastValueFrom)(this.inventoryClient.send({ cmd: 'add_stock' }, data).pipe((0, rxjs_1.timeout)(10000)));
        }, {
            timeout: 10000,
            errorThresholdPercentage: 50,
            resetTimeout: 30000,
            name: 'inventory_add_stock',
        });
        this.addStockCircuit.fallback(() => {
            throw new common_1.ServiceUnavailableException('Add stock service is temporarily unavailable. Please try again later.');
        });
        this.getAvailableProductsCircuit = this.circuitBreakerService.createCircuitBreaker(async () => {
            return await (0, rxjs_1.lastValueFrom)(this.inventoryClient.send({ cmd: 'get_available_products' }, {}).pipe((0, rxjs_1.timeout)(5000)));
        }, {
            timeout: 5000,
            errorThresholdPercentage: 50,
            resetTimeout: 30000,
            name: 'inventory_get_available_products',
        });
        this.getAvailableProductsCircuit.fallback(() => {
            throw new common_1.ServiceUnavailableException('Get available products service is temporarily unavailable. Please try again later.');
        });
        this.getInventoryForProductCircuit = this.circuitBreakerService.createCircuitBreaker(async (id) => {
            return await (0, rxjs_1.lastValueFrom)(this.inventoryClient.send({ cmd: 'get_inventory_for_product' }, { id }).pipe((0, rxjs_1.timeout)(5000)));
        }, {
            timeout: 5000,
            errorThresholdPercentage: 50,
            resetTimeout: 30000,
            name: 'inventory_get_inventory_for_product',
        });
        this.getInventoryForProductCircuit.fallback(() => {
            throw new common_1.ServiceUnavailableException('Get inventory for product service is temporarily unavailable. Please try again later.');
        });
        this.createInventoryCircuit = this.circuitBreakerService.createCircuitBreaker(async (data) => {
            return await (0, rxjs_1.lastValueFrom)(this.inventoryClient.send({ cmd: 'create_inventory' }, data).pipe((0, rxjs_1.timeout)(10000)));
        }, {
            timeout: 10000,
            errorThresholdPercentage: 50,
            resetTimeout: 30000,
            name: 'inventory_create_inventory',
        });
        this.createInventoryCircuit.fallback(() => {
            throw new common_1.ServiceUnavailableException('Create inventory service is temporarily unavailable. Please try again later.');
        });
        this.updateInventoryCircuit = this.circuitBreakerService.createCircuitBreaker(async (data) => {
            return await (0, rxjs_1.lastValueFrom)(this.inventoryClient.send({ cmd: 'update_inventory' }, data).pipe((0, rxjs_1.timeout)(10000)));
        }, {
            timeout: 10000,
            errorThresholdPercentage: 50,
            resetTimeout: 30000,
            name: 'inventory_update_inventory',
        });
        this.updateInventoryCircuit.fallback(() => {
            throw new common_1.ServiceUnavailableException('Update inventory service is temporarily unavailable. Please try again later.');
        });
    }
    async reduceStock(body) {
        try {
            return await this.reduceStockCircuit.fire(body);
        }
        catch (error) {
            this.logger.error(`Reduce stock failed: ${error.message}`);
            throw error;
        }
    }
    async releaseStock(body) {
        try {
            return await this.releaseStockCircuit.fire(body);
        }
        catch (error) {
            this.logger.error(`Release stock failed: ${error.message}`);
            throw error;
        }
    }
    async reserveStock(body) {
        try {
            return await this.reserveStockCircuit.fire(body);
        }
        catch (error) {
            this.logger.error(`Reserve stock failed: ${error.message}`);
            throw error;
        }
    }
    async addStock(body) {
        try {
            return await this.addStockCircuit.fire(body);
        }
        catch (error) {
            this.logger.error(`Add stock failed: ${error.message}`);
            throw error;
        }
    }
    async getAvailableProducts() {
        try {
            return await this.getAvailableProductsCircuit.fire();
        }
        catch (error) {
            this.logger.error(`Get available products failed: ${error.message}`);
            throw error;
        }
    }
    async getInventoryForProduct(id) {
        try {
            return await this.getInventoryForProductCircuit.fire({ id });
        }
        catch (error) {
            this.logger.error(`Get inventory for product failed: ${error.message}`);
            throw error;
        }
    }
    async createInventory(body) {
        try {
            return await this.createInventoryCircuit.fire(body);
        }
        catch (error) {
            this.logger.error(`Create inventory failed: ${error.message}`);
            throw error;
        }
    }
    async updateInventory(productId, body) {
        try {
            return await this.updateInventoryCircuit.fire(Object.assign({ productId }, body));
        }
        catch (error) {
            this.logger.error(`Update inventory failed: ${error.message}`);
            throw error;
        }
    }
};
exports.InventoryController = InventoryController;
__decorate([
    (0, common_2.Roles)('ADMIN', 'INVENTORY_MANAGER'),
    (0, common_1.Post)('reducestock'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [common_2.ReduceStockDto]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "reduceStock", null);
__decorate([
    (0, common_2.Roles)('ADMIN', 'INVENTORY_MANAGER'),
    (0, common_1.Post)('releasestock'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [common_2.ReleaseStockDto]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "releaseStock", null);
__decorate([
    (0, common_2.Roles)('ADMIN', 'INVENTORY_MANAGER'),
    (0, common_1.Post)('reservestock'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [common_2.ReserveStockDto]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "reserveStock", null);
__decorate([
    (0, common_2.Roles)('ADMIN', 'INVENTORY_MANAGER'),
    (0, common_1.Post)('addstock'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [common_2.AddStockDto]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "addStock", null);
__decorate([
    (0, common_2.Public)(),
    (0, common_1.Get)('getavailableproducts'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "getAvailableProducts", null);
__decorate([
    (0, common_2.Public)(),
    (0, common_1.Get)('getinventoryforproduct/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "getInventoryForProduct", null);
__decorate([
    (0, common_2.Roles)('ADMIN', 'INVENTORY_MANAGER'),
    (0, common_1.Post)('createinventory'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [common_2.CreateInventoryDto]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "createInventory", null);
__decorate([
    (0, common_2.Roles)('ADMIN', 'INVENTORY_MANAGER'),
    (0, common_1.Patch)('updateinventory/:productId'),
    __param(0, (0, common_1.Param)('productId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, common_2.UpdateInventoryDto]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "updateInventory", null);
exports.InventoryController = InventoryController = InventoryController_1 = __decorate([
    (0, common_1.UseGuards)(jwt_blacklist_guard_1.JwtBlacklistGuard),
    (0, common_1.Controller)('inventory'),
    __param(0, (0, common_1.Inject)('INVENTORY_SERVICE')),
    __metadata("design:paramtypes", [microservices_1.ClientProxy,
        common_3.CircuitBreakerService])
], InventoryController);
//# sourceMappingURL=inventory.controller.js.map