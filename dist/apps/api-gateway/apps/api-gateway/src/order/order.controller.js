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
exports.OrderController = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const common_2 = require("../../../../libs/common/src");
const rxjs_1 = require("rxjs");
const jwt_blacklist_guard_1 = require("../guards/jwt-blacklist.guard");
let OrderController = class OrderController {
    constructor(orderClient) {
        this.orderClient = orderClient;
    }
    async createOrder(req, createOrderDto) {
        const userId = req.user.userId;
        return (0, rxjs_1.lastValueFrom)(this.orderClient.send({ cmd: 'create_order' }, { userId, dto: createOrderDto }));
    }
    async getUserOrders(req) {
        const userId = req.user.userId;
        return (0, rxjs_1.lastValueFrom)(this.orderClient.send({ cmd: 'get_user_orders' }, userId));
    }
    async getAllOrders() {
        return (0, rxjs_1.lastValueFrom)(this.orderClient.send({ cmd: 'get_all_orders' }, {}));
    }
    async getOrderById(id) {
        return (0, rxjs_1.lastValueFrom)(this.orderClient.send({ cmd: 'get_order_by_id' }, id));
    }
    async cancelOrder(req, orderId) {
        const userId = req.user.userId;
        return (0, rxjs_1.lastValueFrom)(this.orderClient.send({ cmd: 'cancel_order' }, { userId, dto: { orderId, userId } }));
    }
    async updateOrderStatus(orderId, updateDto) {
        return (0, rxjs_1.lastValueFrom)(this.orderClient.send({ cmd: 'update_order_status' }, { orderId, status: updateDto.status }));
    }
    async addPaymentRecord(orderId, paymentDto) {
        return (0, rxjs_1.lastValueFrom)(this.orderClient.send({ cmd: 'add_payment_record' }, Object.assign(Object.assign({}, paymentDto), { orderId })));
    }
};
exports.OrderController = OrderController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, common_2.CreateOrderDto]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "createOrder", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "getUserOrders", null);
__decorate([
    (0, common_1.Get)('all'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "getAllOrders", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "getOrderById", null);
__decorate([
    (0, common_1.Patch)(':id/cancel'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "cancelOrder", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "updateOrderStatus", null);
__decorate([
    (0, common_1.Post)(':id/payment'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, common_2.AddPaymentRecordDto]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "addPaymentRecord", null);
exports.OrderController = OrderController = __decorate([
    (0, common_1.Controller)('orders'),
    (0, common_1.UseGuards)(jwt_blacklist_guard_1.JwtBlacklistGuard),
    __param(0, (0, common_1.Inject)('ORDER_SERVICE')),
    __metadata("design:paramtypes", [microservices_1.ClientProxy])
], OrderController);
//# sourceMappingURL=order.controller.js.map