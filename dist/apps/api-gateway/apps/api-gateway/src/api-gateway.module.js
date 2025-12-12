"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiGatewayModule = void 0;
const common_1 = require("@nestjs/common");
const auth_controller_1 = require("./auth/auth.controller");
const cart_controller_1 = require("./cart/cart.controller");
const inventory_controller_1 = require("./inventory/inventory.controller");
const notifications_controller_1 = require("./notifications/notifications.controller");
const order_controller_1 = require("./order/order.controller");
const payment_controller_1 = require("./payment/payment.controller");
const product_controller_1 = require("./product/product.controller");
const core_1 = require("@nestjs/core");
const common_2 = require("../../../libs/common/src");
const users_controller_1 = require("./users/users.controller");
const users_address_controller_1 = require("./users-address/users-address.controller");
const microservices_1 = require("@nestjs/microservices");
const shipping_controller_1 = require("./shipping/shipping.controller");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const passport_1 = require("@nestjs/passport");
const jwt_strategy_1 = require("./strategy/jwt.strategy");
const jwt_blacklist_guard_1 = require("./guards/jwt-blacklist.guard");
let ApiGatewayModule = class ApiGatewayModule {
};
exports.ApiGatewayModule = ApiGatewayModule;
exports.ApiGatewayModule = ApiGatewayModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            passport_1.PassportModule,
            jwt_1.JwtModule.registerAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (config) => ({
                    secret: config.get('JWT_SECRET') || 'defaultSecret',
                    signOptions: { expiresIn: '1h' },
                }),
            }),
            microservices_1.ClientsModule.registerAsync([
                {
                    name: 'PRODUCT_SERVICE',
                    imports: [config_1.ConfigModule],
                    inject: [config_1.ConfigService],
                    useFactory: (config) => ({
                        transport: microservices_1.Transport.RMQ,
                        options: {
                            urls: [config.get('RABBITMQ_URL')],
                            queue: config.get('PRODUCT_QUEUE'),
                            queueOptions: { durable: true },
                        },
                    }),
                },
                {
                    name: 'AUTH_SERVICE',
                    imports: [config_1.ConfigModule],
                    inject: [config_1.ConfigService],
                    useFactory: (config) => ({
                        transport: microservices_1.Transport.RMQ,
                        options: {
                            urls: [config.get('RABBITMQ_URL')],
                            queue: config.get('AUTH_QUEUE'),
                            queueOptions: { durable: true },
                        },
                    }),
                },
                {
                    name: 'CART_SERVICE',
                    imports: [config_1.ConfigModule],
                    inject: [config_1.ConfigService],
                    useFactory: (config) => ({
                        transport: microservices_1.Transport.RMQ,
                        options: {
                            urls: [config.get('RABBITMQ_URL')],
                            queue: common_2.QUEUES.CART_QUEUE,
                            queueOptions: { durable: true },
                        },
                    }),
                },
                {
                    name: 'INVENTORY_SERVICE',
                    imports: [config_1.ConfigModule],
                    inject: [config_1.ConfigService],
                    useFactory: (config) => ({
                        transport: microservices_1.Transport.RMQ,
                        options: {
                            urls: [config.get('RABBITMQ_URL')],
                            queue: common_2.QUEUES.INVENTORY_QUEUE,
                            queueOptions: { durable: true },
                        },
                    }),
                },
                {
                    name: 'ORDER_SERVICE',
                    imports: [config_1.ConfigModule],
                    inject: [config_1.ConfigService],
                    useFactory: (config) => ({
                        transport: microservices_1.Transport.RMQ,
                        options: {
                            urls: [config.get('RABBITMQ_URL')],
                            queue: common_2.QUEUES.ORDER_QUEUE,
                            queueOptions: { durable: true },
                        },
                    }),
                },
                {
                    name: 'PAYMENT_SERVICE',
                    imports: [config_1.ConfigModule],
                    inject: [config_1.ConfigService],
                    useFactory: (config) => ({
                        transport: microservices_1.Transport.RMQ,
                        options: {
                            urls: [config.get('RABBITMQ_URL')],
                            queue: common_2.QUEUES.PAYMENT_QUEUE,
                            queueOptions: { durable: true },
                        },
                    }),
                },
                {
                    name: 'SHIPPING_SERVICE',
                    imports: [config_1.ConfigModule],
                    inject: [config_1.ConfigService],
                    useFactory: (config) => ({
                        transport: microservices_1.Transport.RMQ,
                        options: {
                            urls: [config.get('RABBITMQ_URL')],
                            queue: common_2.QUEUES.SHIPPING_QUEUE,
                            queueOptions: { durable: true },
                        },
                    }),
                }
            ]),
        ],
        controllers: [
            auth_controller_1.AuthController,
            cart_controller_1.CartController,
            inventory_controller_1.InventoryController,
            notifications_controller_1.NotificationsController,
            order_controller_1.OrderController,
            payment_controller_1.PaymentController,
            product_controller_1.ProductController,
            users_controller_1.UsersController,
            users_address_controller_1.UsersAddressController,
            shipping_controller_1.ShippingController,
        ],
        providers: [
            jwt_strategy_1.JwtStrategy,
            jwt_blacklist_guard_1.JwtBlacklistGuard,
            {
                provide: core_1.APP_FILTER,
                useClass: common_2.HttpExceptionFilter,
            },
            {
                provide: core_1.APP_INTERCEPTOR,
                useClass: common_2.TimeoutInterceptor,
            },
            {
                provide: core_1.APP_PIPE,
                useClass: common_2.TrimPipe,
            },
            {
                provide: core_1.APP_INTERCEPTOR,
                useClass: common_2.ResponseInterceptor,
            },
        ],
    })
], ApiGatewayModule);
//# sourceMappingURL=api-gateway.module.js.map