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
var CartController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartController = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const common_2 = require("../../../../libs/common/src");
const jwt_blacklist_guard_1 = require("../guards/jwt-blacklist.guard");
const rxjs_1 = require("rxjs");
const common_3 = require("../../../../libs/common/src");
let CartController = CartController_1 = class CartController {
    constructor(cartService, circuitBreakerService) {
        this.cartService = cartService;
        this.circuitBreakerService = circuitBreakerService;
        this.logger = new common_1.Logger(CartController_1.name);
    }
    async onModuleInit() {
        this.initializeCircuitBreakers();
    }
    initializeCircuitBreakers() {
        this.addToCartCircuit = this.circuitBreakerService.createCircuitBreaker(async (data) => {
            return await (0, rxjs_1.lastValueFrom)(this.cartService.send({ cmd: 'add_to_cart' }, data).pipe((0, rxjs_1.timeout)(10000)));
        }, {
            timeout: 10000,
            errorThresholdPercentage: 50,
            resetTimeout: 30000,
            name: 'cart_add_to_cart',
        });
        this.addToCartCircuit.fallback(() => {
            throw new common_1.ServiceUnavailableException('Add to cart service is temporarily unavailable. Please try again later.');
        });
        this.getCartCircuit = this.circuitBreakerService.createCircuitBreaker(async (data) => {
            return await (0, rxjs_1.lastValueFrom)(this.cartService.send({ cmd: 'get_cart' }, data).pipe((0, rxjs_1.timeout)(5000)));
        }, {
            timeout: 5000,
            errorThresholdPercentage: 50,
            resetTimeout: 30000,
            name: 'cart_get_cart',
        });
        this.getCartCircuit.fallback(() => {
            throw new common_1.ServiceUnavailableException('Get cart service is temporarily unavailable. Please try again later.');
        });
        this.updateCartItemCircuit = this.circuitBreakerService.createCircuitBreaker(async (data) => {
            return await (0, rxjs_1.lastValueFrom)(this.cartService.send({ cmd: 'update_cart_item' }, data).pipe((0, rxjs_1.timeout)(5000)));
        }, {
            timeout: 5000,
            errorThresholdPercentage: 50,
            resetTimeout: 30000,
            name: 'cart_update_cart_item',
        });
        this.updateCartItemCircuit.fallback(() => {
            throw new common_1.ServiceUnavailableException('Update cart item service is temporarily unavailable. Please try again later.');
        });
        this.removeCartItemCircuit = this.circuitBreakerService.createCircuitBreaker(async (productId) => {
            return await (0, rxjs_1.lastValueFrom)(this.cartService.send({ cmd: 'remove_from_cart' }, { productId }).pipe((0, rxjs_1.timeout)(5000)));
        }, {
            timeout: 5000,
            errorThresholdPercentage: 50,
            resetTimeout: 30000,
            name: 'cart_remove_from_cart',
        });
        this.removeCartItemCircuit.fallback(() => {
            throw new common_1.ServiceUnavailableException('Remove cart item service is temporarily unavailable. Please try again later.');
        });
        this.clearCartCircuit = this.circuitBreakerService.createCircuitBreaker(async (userId) => {
            return await (0, rxjs_1.lastValueFrom)(this.cartService.send({ cmd: 'clear_cart' }, { userId }).pipe((0, rxjs_1.timeout)(5000)));
        }, {
            timeout: 5000,
            errorThresholdPercentage: 50,
            resetTimeout: 30000,
            name: 'cart_clear_cart',
        });
        this.clearCartCircuit.fallback(() => {
            throw new common_1.ServiceUnavailableException('Clear cart service is temporarily unavailable. Please try again later.');
        });
    }
    async addToCart(body, req) {
        try {
            return await this.addToCartCircuit.fire(Object.assign(Object.assign({}, body), { userId: req.user.id }));
        }
        catch (error) {
            this.logger.error(`add to cart failed: ${error}`);
            throw error;
        }
    }
    async getCart(req) {
        try {
            return await this.getCartCircuit.fire({ userId: req.user.id });
        }
        catch (error) {
            this.logger.error(`get cart failed: ${error}`);
            throw error;
        }
    }
    async updateCartItem(productId, body, req) {
        try {
            return await this.updateCartItemCircuit.fire(Object.assign(Object.assign({ productId }, body), { userId: req.user.id }));
        }
        catch (error) {
            this.logger.error(`update cart item failed: ${error}`);
            throw error;
        }
    }
    async removeCartItem(productId, req) {
        try {
            return await this.removeCartItemCircuit.fire({ productId, userId: req.user.id });
        }
        catch (error) {
            this.logger.error(`remove cart item failed: ${error}`);
            throw error;
        }
    }
    async clearCart(req) {
        try {
            return await this.clearCartCircuit.fire({ userId: req.user.id });
        }
        catch (error) {
            this.logger.error(`clear cart failed: ${error}`);
            throw error;
        }
    }
};
exports.CartController = CartController;
__decorate([
    (0, common_1.Post)('addtocart'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [common_2.AddToCartDto, Object]),
    __metadata("design:returntype", Promise)
], CartController.prototype, "addToCart", null);
__decorate([
    (0, common_1.Get)('getcart'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CartController.prototype, "getCart", null);
__decorate([
    (0, common_1.Patch)('/updatecartitem/:productId'),
    __param(0, (0, common_1.Param)('productId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, common_2.UpdateCartQuantityDto, Object]),
    __metadata("design:returntype", Promise)
], CartController.prototype, "updateCartItem", null);
__decorate([
    (0, common_1.Delete)('/removecartitem/:productId'),
    __param(0, (0, common_1.Param)('productId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CartController.prototype, "removeCartItem", null);
__decorate([
    (0, common_1.Delete)('clearcart'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CartController.prototype, "clearCart", null);
exports.CartController = CartController = CartController_1 = __decorate([
    (0, common_1.UseGuards)(jwt_blacklist_guard_1.JwtBlacklistGuard),
    (0, common_1.Controller)('cart'),
    __param(0, (0, common_1.Inject)('CART_SERVICE')),
    __metadata("design:paramtypes", [microservices_1.ClientProxy,
        common_3.CircuitBreakerService])
], CartController);
//# sourceMappingURL=cart.controller.js.map