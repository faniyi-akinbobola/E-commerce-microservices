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
var ProductController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductController = void 0;
const common_1 = require("@nestjs/common");
const jwt_blacklist_guard_1 = require("../guards/jwt-blacklist.guard");
const microservices_1 = require("@nestjs/microservices");
const common_2 = require("@nestjs/common");
const common_3 = require("../../../../libs/common/src");
const common_4 = require("../../../../libs/common/src");
const rxjs_1 = require("rxjs");
let ProductController = ProductController_1 = class ProductController {
    constructor(productClient, circuitBreakerService) {
        this.productClient = productClient;
        this.circuitBreakerService = circuitBreakerService;
        this.Logger = new common_1.Logger(ProductController_1.name);
    }
    async onModuleInit() {
        this.initializeCircuitBreakers();
    }
    initializeCircuitBreakers() {
        this.createProductCircuit = this.circuitBreakerService.createCircuitBreaker(async (data) => {
            return await (0, rxjs_1.lastValueFrom)(this.productClient.send({ cmd: 'create_product' }, data).pipe((0, rxjs_1.timeout)(10000)));
        }, {
            timeout: 10000,
            errorThresholdPercentage: 50,
            resetTimeout: 30000,
            name: 'create_product',
        });
        this.createProductCircuit.fallback(() => {
            throw new common_1.ServiceUnavailableException("Create product service is currently unavailable. Please try again later.");
        });
        this.getProductsCircuit = this.circuitBreakerService.createCircuitBreaker(async () => {
            return await (0, rxjs_1.lastValueFrom)(this.productClient.send({ cmd: 'get_all_products' }, {}).pipe((0, rxjs_1.timeout)(5000)));
        }, {
            timeout: 5000,
            errorThresholdPercentage: 50,
            resetTimeout: 30000,
            name: 'get_all_products'
        });
        this.getProductsCircuit.fallback(() => {
            throw new common_1.ServiceUnavailableException("Get products service is currently unavailable. Please try again later.");
        });
        this.getProductsByIdCircuit = this.circuitBreakerService.createCircuitBreaker(async (id) => {
            return await (0, rxjs_1.lastValueFrom)(this.productClient.send({ cmd: 'get_product_by_id' }, { id }).pipe((0, rxjs_1.timeout)(5000)));
        }, {
            timeout: 5000,
            errorThresholdPercentage: 50,
            resetTimeout: 30000,
            name: 'get_product_by_id'
        });
        this.getProductsByIdCircuit.fallback(() => {
            throw new common_1.ServiceUnavailableException('Get products by id service is currently unavailable. Please try again later.');
        });
        this.getProductsBySlugCircuit = this.circuitBreakerService.createCircuitBreaker(async (slug) => {
            return await (0, rxjs_1.lastValueFrom)(this.productClient.send({ cmd: 'get_products_by_slug' }, { slug }).pipe((0, rxjs_1.timeout)(5000)));
        }, {
            timeout: 5000,
            errorThresholdPercentage: 50,
            resetTimeout: 30000,
            name: "get_products_by_slug"
        });
        this.getProductsBySlugCircuit.fallback(() => {
            throw new common_1.ServiceUnavailableException("Get products by slug service is currently unavailable. Please try again later.");
        });
        this.getAvailableProductsCircuit = this.circuitBreakerService.createCircuitBreaker(async () => {
            return await (0, rxjs_1.lastValueFrom)(this.productClient.send({ cmd: 'get_available_products' }, {}).pipe((0, rxjs_1.timeout)(5000)));
        }, {
            timeout: 5000,
            errorThresholdPercentage: 50,
            resetTimeout: 30000,
            name: "get_available_products"
        });
        this.getAvailableProductsCircuit.fallback(() => {
            throw new common_1.ServiceUnavailableException('Get available products service is currently unavailable. Please try again later.');
        });
        this.updateProductCircuit = this.circuitBreakerService.createCircuitBreaker(async (data) => {
            return await (0, rxjs_1.lastValueFrom)(this.productClient.send({ cmd: 'update_product' }, data).pipe((0, rxjs_1.timeout)(5000)));
        }, {
            timeout: 10000,
            errorThresholdPercentage: 50,
            resetTimeout: 30000,
            name: "update_product"
        });
        this.updateProductCircuit.fallback(() => {
            throw new common_1.ServiceUnavailableException("Update products service is currently unavailable. Please try again later.");
        });
        this.deleteProductCircuit = this.circuitBreakerService.createCircuitBreaker(async (id) => {
            return await (0, rxjs_1.lastValueFrom)(this.productClient.send({ cmd: 'delete_product' }, { id }).pipe((0, rxjs_1.timeout)(5000)));
        }, {
            timeout: 5000,
            errorThresholdPercentage: 50,
            resetTimeout: 30000,
            name: "delete_product"
        });
        this.deleteProductCircuit.fallback(() => {
            throw new common_1.ServiceUnavailableException("Delete products service is currently unavailable. Please try again later.");
        });
        this.getProductsByCategoryCircuit = this.circuitBreakerService.createCircuitBreaker(async () => {
            return await (0, rxjs_1.lastValueFrom)(this.productClient.send({ cmd: "get_products_by_category" }, {}).pipe((0, rxjs_1.timeout)(5000)));
        }, {
            timeout: 5000,
            errorThresholdPercentage: 50,
            resetTimeout: 30000,
            name: "get_products_by_category"
        });
        this.getProductsByCategoryCircuit.fallback(() => {
            throw new common_1.ServiceUnavailableException("Get products by category service is currently unavailable. Please try again later.");
        });
        this.createCategoryCircuit = this.circuitBreakerService.createCircuitBreaker(async () => {
            return await (0, rxjs_1.lastValueFrom)(this.productClient.send({ cmd: "create_category" }, {}).pipe((0, rxjs_1.timeout)(5000)));
        }, {
            timeout: 10000,
            errorThresholdPercentage: 50,
            resetTimeout: 30000,
            name: "create_category"
        });
        this.createCategoryCircuit.fallback(() => {
            throw new common_1.ServiceUnavailableException("Create category service is currently unavailable. Please try again later.");
        });
        this.getCategoriesCircuit = this.circuitBreakerService.createCircuitBreaker(async () => {
            return await (0, rxjs_1.lastValueFrom)(this.productClient.send({ cmd: "get_all_categories" }, {}).pipe((0, rxjs_1.timeout)(5000)));
        }, {
            timeout: 5000,
            errorThresholdPercentage: 50,
            resetTimeout: 30000,
            name: "get_all_categories"
        });
        this.getCategoriesCircuit.fallback(() => {
            throw new common_1.ServiceUnavailableException("Get category service is currently unavailable. Please try again later.");
        });
        this.getCategoriesByIdCircuit = this.circuitBreakerService.createCircuitBreaker(async (id) => {
            return await this.productClient.send({ cmd: "get_category_by_id" }, { id }).pipe((0, rxjs_1.timeout)(5000));
        }, {
            timeout: 5000,
            errorThresholdPercentage: 50,
            resetTimeout: 30000,
            name: "get_category_by_id"
        });
        this.getCategoriesByIdCircuit.fallback(() => {
            throw new common_1.ServiceUnavailableException("Get categories by id service is currently unavailable. Please try again later.");
        });
        this.updateCategoryCircuit = this.circuitBreakerService.createCircuitBreaker(async (data) => {
            return await (0, rxjs_1.lastValueFrom)(this.productClient.send({ cmd: "update_category" }, data).pipe((0, rxjs_1.timeout)(5000)));
        }, {
            timeout: 10000,
            errorThresholdPercentage: 50,
            resetTimeout: 30000,
            name: "update_category"
        });
        this.updateCategoryCircuit.fallback(() => {
            throw new common_1.ServiceUnavailableException("Update category service is currently unavailable. Please try again later.");
        });
        this.deleteCategoryCircuit = this.circuitBreakerService.createCircuitBreaker(async (id) => {
            return await (0, rxjs_1.lastValueFrom)(this.productClient.send({ cmd: "delete_category" }, { id }).pipe((0, rxjs_1.timeout)(5000)));
        }, {
            timeout: 5000,
            errorThresholdPercentage: 50,
            resetTimeout: 30000,
            name: "delete_category"
        });
        this.deleteCategoryCircuit.fallback(() => {
            throw new common_1.ServiceUnavailableException("Delete category service is currently unavailable. Please try again later.");
        });
        this.getCategoriesBySlugCircuit = this.circuitBreakerService.createCircuitBreaker(async (slug) => {
            return await (0, rxjs_1.lastValueFrom)(this.productClient.send({ cmd: "get_categories_by_slug" }, { slug }).pipe((0, rxjs_1.timeout)(5000)));
        }, {
            timeout: 5000,
            errorThresholdPercentage: 50,
            resetTimeout: 30000,
            name: "get_categories_by_slug"
        });
        this.getCategoriesBySlugCircuit.fallback(() => {
            throw new common_1.ServiceUnavailableException("Get categories by slug service is currently unavailable. Please try again later.");
        });
    }
    async createProduct(body) {
        try {
            return await this.createProductCircuit.fire(body);
        }
        catch (error) {
            this.Logger.error(`create product failed: ${error}`);
            throw error;
        }
    }
    async getProducts() {
        try {
            return await this.getProductsCircuit.fire();
        }
        catch (error) {
            this.Logger.error(`get products failed: ${error}`);
            throw error;
        }
    }
    async getProductById(id) {
        try {
            return await this.getProductsByIdCircuit.fire(id);
        }
        catch (error) {
            this.Logger.error(`get product by id failed: ${error}`);
            throw error;
        }
    }
    async getProductsBySlug(slug) {
        try {
            return await this.getProductsBySlugCircuit.fire(slug);
        }
        catch (error) {
            this.Logger.error(`get products by slug failed: ${error}`);
            throw error;
        }
    }
    async getAvailableProducts() {
        try {
            return await this.getAvailableProductsCircuit.fire();
        }
        catch (error) {
            this.Logger.error(`get available products failed: ${error}`);
        }
    }
    async updateProduct(body) {
        try {
            return await this.updateProductCircuit.fire(body);
        }
        catch (error) {
            this.Logger.error(`update product failed: ${error}`);
            throw error;
        }
    }
    async deleteProduct(id) {
        try {
            return await this.deleteProductCircuit.fire(id);
        }
        catch (error) {
            this.Logger.error(`delete product failed: ${error}`);
            throw error;
        }
    }
    async getProductsByCategory(slug) {
        try {
            return await this.getProductsByCategoryCircuit.fire(slug);
        }
        catch (error) {
            this.Logger.error(`get products category by slug failed: ${error}`);
        }
    }
    async createCategory(body) {
        try {
            return await this.createCategoryCircuit.fire(body);
        }
        catch (error) {
            this.Logger.error(`create category failed: ${error}`);
            throw error;
        }
    }
    async getCategories() {
        try {
            return await this.getCategoriesCircuit.fire();
        }
        catch (error) {
            this.Logger.error(`get categories failed: ${error}`);
            throw error;
        }
    }
    async getCategoryById(id) {
        try {
            return await this.getCategoriesByIdCircuit.fire(id);
        }
        catch (error) {
            this.Logger.error(`get category by id failed: ${error}`);
            throw error;
        }
    }
    async updateCategory(id, body) {
        try {
            return await this.updateCategoryCircuit.fire(Object.assign({ id }, body));
        }
        catch (error) {
            this.Logger.error(`update category failed: ${error}`);
            throw error;
        }
    }
    async deleteCategory(id) {
        try {
            return await this.deleteCategoryCircuit.fire(id);
        }
        catch (error) {
            this.Logger.error(`delete category failed: ${error}`);
            throw error;
        }
    }
    async getCategoriesBySlug(slug) {
        try {
            return await this.getCategoriesBySlugCircuit.fire(slug);
        }
        catch (error) {
            this.Logger.error(`get categories by slug: ${error}`);
            throw error;
        }
    }
};
exports.ProductController = ProductController;
__decorate([
    (0, common_4.Roles)('ADMIN', 'INVENTORY_MANAGER'),
    (0, common_1.Post)('createproduct'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [common_3.CreateProductDto]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "createProduct", null);
__decorate([
    (0, common_3.Public)(),
    (0, common_1.Get)('getproducts'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "getProducts", null);
__decorate([
    (0, common_3.Public)(),
    (0, common_1.Get)('getproduct/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "getProductById", null);
__decorate([
    (0, common_3.Public)(),
    (0, common_1.Get)('getproductsbyslug/:slug'),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "getProductsBySlug", null);
__decorate([
    (0, common_3.Public)(),
    (0, common_1.Get)('getavailableproducts'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "getAvailableProducts", null);
__decorate([
    (0, common_4.Roles)('ADMIN', 'INVENTORY_MANAGER'),
    (0, common_1.Patch)('updateproduct'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "updateProduct", null);
__decorate([
    (0, common_4.Roles)('ADMIN', 'INVENTORY_MANAGER'),
    (0, common_1.Delete)('deleteproduct/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "deleteProduct", null);
__decorate([
    (0, common_3.Public)(),
    (0, common_1.Get)('getproductsbycategory/:slug'),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "getProductsByCategory", null);
__decorate([
    (0, common_4.Roles)('ADMIN', 'INVENTORY_MANAGER'),
    (0, common_1.Post)('createcategory'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [common_3.CreateCategoryDto]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "createCategory", null);
__decorate([
    (0, common_3.Public)(),
    (0, common_1.Get)('getcategories'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "getCategories", null);
__decorate([
    (0, common_3.Public)(),
    (0, common_1.Get)('getcategory/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "getCategoryById", null);
__decorate([
    (0, common_4.Roles)('ADMIN', 'INVENTORY_MANAGER'),
    (0, common_1.Patch)('updatecategory/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, common_3.UpdateCategoryDto]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "updateCategory", null);
__decorate([
    (0, common_4.Roles)('ADMIN', 'INVENTORY_MANAGER'),
    (0, common_1.Delete)('deletecategory/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "deleteCategory", null);
__decorate([
    (0, common_3.Public)(),
    (0, common_1.Get)('getcategoriesbyslug/:slug'),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "getCategoriesBySlug", null);
exports.ProductController = ProductController = ProductController_1 = __decorate([
    (0, common_1.UseGuards)(jwt_blacklist_guard_1.JwtBlacklistGuard, common_3.RolesGuard),
    (0, common_1.Controller)('product'),
    __param(0, (0, common_2.Inject)('PRODUCT_SERVICE')),
    __metadata("design:paramtypes", [microservices_1.ClientProxy,
        common_3.CircuitBreakerService])
], ProductController);
//# sourceMappingURL=product.controller.js.map