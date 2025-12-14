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
var OrderController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderController = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const common_2 = require("../../../../libs/common/src");
const rxjs_1 = require("rxjs");
const jwt_blacklist_guard_1 = require("../guards/jwt-blacklist.guard");
let OrderController = OrderController_1 = class OrderController {
    constructor(orderClient, circuitBreakerService) {
        this.orderClient = orderClient;
        this.circuitBreakerService = circuitBreakerService;
        this.logger = new common_1.Logger(OrderController_1.name);
    }
    async onModuleInit() {
        this.initializeCircuitBreakers();
    }
    initializeCircuitBreakers() {
        this.createOrderCircuit = this.circuitBreakerService.createCircuitBreaker(async (data) => {
            return await (0, rxjs_1.lastValueFrom)(this.orderClient.send({ cmd: 'create_order' }, data).pipe((0, rxjs_1.timeout)(10000)));
        }, {
            timeout: 10000,
            errorThresholdPercentage: 50,
            resetTimeout: 30000,
            name: 'order_create',
        });
        this.createOrderCircuit.fallback(() => {
            throw new Error('Order creation service is temporarily unavailable. Please try again later.');
        });
        this.getUserOrdersCircuit = this.circuitBreakerService.createCircuitBreaker(async (userId) => {
            return await (0, rxjs_1.lastValueFrom)(this.orderClient.send({ cmd: 'get_user_orders' }, userId).pipe((0, rxjs_1.timeout)(5000)));
        }, {
            timeout: 5000,
            errorThresholdPercentage: 50,
            resetTimeout: 30000,
            name: 'order_get_user_orders',
        });
        this.getUserOrdersCircuit.fallback(() => {
            throw new Error('Order retrieval service is temporarily unavailable. Please try again later.');
        });
        this.getAllOrdersCircuit = this.circuitBreakerService.createCircuitBreaker(async () => {
            return await (0, rxjs_1.lastValueFrom)(this.orderClient.send({ cmd: 'get_all_orders' }, {}).pipe((0, rxjs_1.timeout)(5000)));
        }, {
            timeout: 5000,
            errorThresholdPercentage: 50,
            resetTimeout: 30000,
            name: 'order_get_all_orders',
        });
        this.getAllOrdersCircuit.fallback(() => {
            throw new Error('Order retrieval service is temporarily unavailable. Please try again later.');
        });
        this.getOrderByIdCircuit = this.circuitBreakerService.createCircuitBreaker(async (id) => {
            return await (0, rxjs_1.lastValueFrom)(this.orderClient.send({ cmd: 'get_order_by_id' }, id).pipe((0, rxjs_1.timeout)(5000)));
        }, {
            timeout: 5000,
            errorThresholdPercentage: 50,
            resetTimeout: 30000,
            name: 'order_get_by_id',
        });
        this.getOrderByIdCircuit.fallback(() => {
            throw new Error('Order retrieval service is temporarily unavailable. Please try again later.');
        });
        this.cancelOrderCircuit = this.circuitBreakerService.createCircuitBreaker(async (data) => {
            return await (0, rxjs_1.lastValueFrom)(this.orderClient.send({ cmd: 'cancel_order' }, data).pipe((0, rxjs_1.timeout)(5000)));
        }, {
            timeout: 5000,
            errorThresholdPercentage: 50,
            resetTimeout: 30000,
            name: 'order_cancel',
        });
        this.cancelOrderCircuit.fallback(() => {
            throw new Error('Order cancellation service is temporarily unavailable. Please try again later.');
        });
        this.updateOrderStatusCircuit = this.circuitBreakerService.createCircuitBreaker(async (data) => {
            return await (0, rxjs_1.lastValueFrom)(this.orderClient.send({ cmd: 'update_order_status' }, data).pipe((0, rxjs_1.timeout)(5000)));
        }, {
            timeout: 5000,
            errorThresholdPercentage: 50,
            resetTimeout: 30000,
            name: 'order_update_status',
        });
        this.updateOrderStatusCircuit.fallback(() => {
            throw new Error('Order status update service is temporarily unavailable. Please try again later.');
        });
        this.addPaymentRecordCircuit = this.circuitBreakerService.createCircuitBreaker(async (data) => {
            return await (0, rxjs_1.lastValueFrom)(this.orderClient.send({ cmd: 'add_payment_record' }, data).pipe((0, rxjs_1.timeout)(10000)));
        }, {
            timeout: 10000,
            errorThresholdPercentage: 50,
            resetTimeout: 30000,
            name: 'order_add_payment',
        });
        this.addPaymentRecordCircuit.fallback(() => {
            throw new Error('Payment record service is temporarily unavailable. Please try again later.');
        });
        this.logger.log('All order circuit breakers initialized');
    }
    async createOrder(req, createOrderDto) {
        try {
            const userId = req.user.userId;
            return await this.createOrderCircuit.fire({ userId, dto: createOrderDto });
        }
        catch (error) {
            this.logger.error(`Create order failed: ${error.message}`);
            throw error;
        }
    }
    async getUserOrders(req) {
        try {
            const userId = req.user.userId;
            return await this.getUserOrdersCircuit.fire(userId);
        }
        catch (error) {
            this.logger.error(`Get user orders failed: ${error.message}`);
            throw error;
        }
    }
    async getAllOrders() {
        try {
            return await this.getAllOrdersCircuit.fire();
        }
        catch (error) {
            this.logger.error(`Get all orders failed: ${error.message}`);
            throw error;
        }
    }
    async getOrderById(id) {
        try {
            return await this.getOrderByIdCircuit.fire(id);
        }
        catch (error) {
            this.logger.error(`Get order by ID failed: ${error.message}`);
            throw error;
        }
    }
    async cancelOrder(req, orderId) {
        try {
            const userId = req.user.userId;
            return await this.cancelOrderCircuit.fire({ userId, dto: { orderId, userId } });
        }
        catch (error) {
            this.logger.error(`Cancel order failed: ${error.message}`);
            throw error;
        }
    }
    async updateOrderStatus(orderId, updateDto) {
        try {
            return await this.updateOrderStatusCircuit.fire({ orderId, status: updateDto.status });
        }
        catch (error) {
            this.logger.error(`Update order status failed: ${error.message}`);
            throw error;
        }
    }
    async addPaymentRecord(orderId, paymentDto) {
        try {
            return await this.addPaymentRecordCircuit.fire(Object.assign(Object.assign({}, paymentDto), { orderId }));
        }
        catch (error) {
            this.logger.error(`Add payment record failed: ${error.message}`);
            throw error;
        }
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
exports.OrderController = OrderController = OrderController_1 = __decorate([
    (0, common_1.Controller)('orders'),
    (0, common_1.UseGuards)(jwt_blacklist_guard_1.JwtBlacklistGuard),
    __param(0, (0, common_1.Inject)('ORDER_SERVICE')),
    __metadata("design:paramtypes", [microservices_1.ClientProxy,
        common_2.CircuitBreakerService])
], OrderController);
//# sourceMappingURL=order.controller.js.map