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
exports.CartController = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const common_2 = require("../../../../libs/common/src");
const jwt_blacklist_guard_1 = require("../guards/jwt-blacklist.guard");
let CartController = class CartController {
    constructor(cartService) {
        this.cartService = cartService;
    }
    addToCart(body, req) {
        return this.cartService.send({ cmd: 'add_to_cart' }, Object.assign(Object.assign({}, body), { userId: req.user.id }));
    }
    getCart(req) {
        return this.cartService.send({ cmd: 'get_cart' }, { userId: req.user.id });
    }
    updateCartItem(productId, body, req) {
        return this.cartService.send({ cmd: 'update_cart_item' }, Object.assign(Object.assign({ productId }, body), { userId: req.user.id }));
    }
    removeCartItem(productId, req) {
        return this.cartService.send({ cmd: 'remove_from_cart' }, { productId, userId: req.user.id });
    }
    clearCart(req) {
        return this.cartService.send({ cmd: 'clear_cart' }, { userId: req.user.id });
    }
};
exports.CartController = CartController;
__decorate([
    (0, common_1.Post)('addtocart'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [common_2.AddToCartDto, Object]),
    __metadata("design:returntype", void 0)
], CartController.prototype, "addToCart", null);
__decorate([
    (0, common_1.Get)('getcart'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CartController.prototype, "getCart", null);
__decorate([
    (0, common_1.Patch)('/updatecartitem/:productId'),
    __param(0, (0, common_1.Param)('productId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, common_2.UpdateCartQuantityDto, Object]),
    __metadata("design:returntype", void 0)
], CartController.prototype, "updateCartItem", null);
__decorate([
    (0, common_1.Delete)('/removecartitem/:productId'),
    __param(0, (0, common_1.Param)('productId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CartController.prototype, "removeCartItem", null);
__decorate([
    (0, common_1.Delete)('clearcart'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CartController.prototype, "clearCart", null);
exports.CartController = CartController = __decorate([
    (0, common_1.UseGuards)(jwt_blacklist_guard_1.JwtBlacklistGuard),
    (0, common_1.Controller)('cart'),
    __param(0, (0, common_1.Inject)('CART_SERVICE')),
    __metadata("design:paramtypes", [microservices_1.ClientProxy])
], CartController);
//# sourceMappingURL=cart.controller.js.map