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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductController = void 0;
const common_1 = require("@nestjs/common");
const jwt_blacklist_guard_1 = require("../guards/jwt-blacklist.guard");
const microservices_1 = require("@nestjs/microservices");
const common_2 = require("@nestjs/common");
const common_3 = require("../../../../libs/common/src");
const common_4 = require("../../../../libs/common/src");
let ProductController = class ProductController {
    constructor(productClient) {
        this.productClient = productClient;
    }
    createProduct(body) {
        return this.productClient.send({ cmd: 'create_product' }, body);
    }
    getProducts() {
        return this.productClient.send({ cmd: 'get_all_products' }, {});
    }
    getProductById(id) {
        return this.productClient.send({ cmd: 'get_product_by_id' }, { id });
    }
    getProductsBySlug(slug) {
        return this.productClient.send({ cmd: 'get_products_by_slug' }, slug);
    }
    getAvailableProducts() {
        return this.productClient.send({ cmd: 'get_available_products' }, {});
    }
    updateProduct(body) {
        const { id } = body, updateBody = __rest(body, ["id"]);
        return this.productClient.send({ cmd: 'update_product' }, Object.assign({ id }, updateBody));
    }
    deleteProduct(id) {
        return this.productClient.send({ cmd: 'delete_product' }, { id });
    }
    getProductsByCategory(slug) {
        return this.productClient.send({ cmd: 'get_products_by_category' }, { slug });
    }
    createCategory(body) {
        return this.productClient.send({ cmd: 'create_category' }, body);
    }
    getCategories() {
        return this.productClient.send({ cmd: 'get_all_categories' }, {});
    }
    getCategoryById(id) {
        return this.productClient.send({ cmd: 'get_category_by_id' }, { id });
    }
    updateCategory(id, body) {
        return this.productClient.send({ cmd: 'update_category' }, Object.assign({ id }, body));
    }
    deleteCategory(id) {
        return this.productClient.send({ cmd: 'delete_category' }, { id });
    }
    getCategoriesBySlug(slug) {
        return this.productClient.send({ cmd: 'get_categories_by_slug' }, { slug });
    }
};
exports.ProductController = ProductController;
__decorate([
    (0, common_4.Roles)('ADMIN', 'INVENTORY_MANAGER'),
    (0, common_1.Post)('createproduct'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [common_3.CreateProductDto]),
    __metadata("design:returntype", void 0)
], ProductController.prototype, "createProduct", null);
__decorate([
    (0, common_3.Public)(),
    (0, common_1.Get)('getproducts'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ProductController.prototype, "getProducts", null);
__decorate([
    (0, common_3.Public)(),
    (0, common_1.Get)('getproduct/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProductController.prototype, "getProductById", null);
__decorate([
    (0, common_3.Public)(),
    (0, common_1.Get)('getproductsbyslug/:slug'),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProductController.prototype, "getProductsBySlug", null);
__decorate([
    (0, common_3.Public)(),
    (0, common_1.Get)('getavailableproducts'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ProductController.prototype, "getAvailableProducts", null);
__decorate([
    (0, common_4.Roles)('ADMIN', 'INVENTORY_MANAGER'),
    (0, common_1.Patch)('updateproduct'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ProductController.prototype, "updateProduct", null);
__decorate([
    (0, common_4.Roles)('ADMIN', 'INVENTORY_MANAGER'),
    (0, common_1.Delete)('deleteproduct/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProductController.prototype, "deleteProduct", null);
__decorate([
    (0, common_3.Public)(),
    (0, common_1.Get)('getproductsbycategory/:slug'),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProductController.prototype, "getProductsByCategory", null);
__decorate([
    (0, common_4.Roles)('ADMIN', 'INVENTORY_MANAGER'),
    (0, common_1.Post)('createcategory'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [common_3.CreateCategoryDto]),
    __metadata("design:returntype", void 0)
], ProductController.prototype, "createCategory", null);
__decorate([
    (0, common_3.Public)(),
    (0, common_1.Get)('getcategories'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ProductController.prototype, "getCategories", null);
__decorate([
    (0, common_3.Public)(),
    (0, common_1.Get)('getcategory/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProductController.prototype, "getCategoryById", null);
__decorate([
    (0, common_4.Roles)('ADMIN', 'INVENTORY_MANAGER'),
    (0, common_1.Patch)('updatecategory/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, common_3.UpdateCategoryDto]),
    __metadata("design:returntype", void 0)
], ProductController.prototype, "updateCategory", null);
__decorate([
    (0, common_4.Roles)('ADMIN', 'INVENTORY_MANAGER'),
    (0, common_1.Delete)('deletecategory/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProductController.prototype, "deleteCategory", null);
__decorate([
    (0, common_3.Public)(),
    (0, common_1.Get)('getcategoriesbyslug/:slug'),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProductController.prototype, "getCategoriesBySlug", null);
exports.ProductController = ProductController = __decorate([
    (0, common_1.UseGuards)(jwt_blacklist_guard_1.JwtBlacklistGuard, common_3.RolesGuard),
    (0, common_1.Controller)('product'),
    __param(0, (0, common_2.Inject)('PRODUCT_SERVICE')),
    __metadata("design:paramtypes", [microservices_1.ClientProxy])
], ProductController);
//# sourceMappingURL=product.controller.js.map