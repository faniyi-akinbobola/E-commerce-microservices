/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./apps/order/src/database/database.module.ts":
/*!****************************************************!*\
  !*** ./apps/order/src/database/database.module.ts ***!
  \****************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DatabaseModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
let DatabaseModule = class DatabaseModule {
};
exports.DatabaseModule = DatabaseModule;
exports.DatabaseModule = DatabaseModule = __decorate([
    (0, common_1.Module)({})
], DatabaseModule);


/***/ }),

/***/ "./apps/order/src/order.controller.ts":
/*!********************************************!*\
  !*** ./apps/order/src/order.controller.ts ***!
  \********************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.OrderController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const order_service_1 = __webpack_require__(/*! ./order.service */ "./apps/order/src/order.service.ts");
let OrderController = class OrderController {
    constructor(orderService) {
        this.orderService = orderService;
    }
    getHello() {
        return this.orderService.getHello();
    }
};
exports.OrderController = OrderController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", String)
], OrderController.prototype, "getHello", null);
exports.OrderController = OrderController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [typeof (_a = typeof order_service_1.OrderService !== "undefined" && order_service_1.OrderService) === "function" ? _a : Object])
], OrderController);


/***/ }),

/***/ "./apps/order/src/order.module.ts":
/*!****************************************!*\
  !*** ./apps/order/src/order.module.ts ***!
  \****************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.OrderModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const order_controller_1 = __webpack_require__(/*! ./order.controller */ "./apps/order/src/order.controller.ts");
const order_service_1 = __webpack_require__(/*! ./order.service */ "./apps/order/src/order.service.ts");
const database_module_1 = __webpack_require__(/*! ./database/database.module */ "./apps/order/src/database/database.module.ts");
let OrderModule = class OrderModule {
};
exports.OrderModule = OrderModule;
exports.OrderModule = OrderModule = __decorate([
    (0, common_1.Module)({
        imports: [database_module_1.DatabaseModule],
        controllers: [order_controller_1.OrderController],
        providers: [order_service_1.OrderService],
    })
], OrderModule);


/***/ }),

/***/ "./apps/order/src/order.service.ts":
/*!*****************************************!*\
  !*** ./apps/order/src/order.service.ts ***!
  \*****************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.OrderService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
let OrderService = class OrderService {
    getHello() {
        return 'Hello World!';
    }
};
exports.OrderService = OrderService;
exports.OrderService = OrderService = __decorate([
    (0, common_1.Injectable)()
], OrderService);


/***/ }),

/***/ "./libs/common/src/constants/constants.ts":
/*!************************************************!*\
  !*** ./libs/common/src/constants/constants.ts ***!
  \************************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.QUEUES = void 0;
exports.QUEUES = {
    ORDER_QUEUE: 'order_queue',
    PAYMENT_QUEUE: 'payment_queue',
    INVENTORY_QUEUE: 'inventory_queue',
    NOTIFICATIONS_QUEUE: 'notifications_queue',
    CART_QUEUE: 'cart_queue',
    AUTH_QUEUE: 'auth_queue',
    PRODUCT_QUEUE: 'product_queue',
};


/***/ }),

/***/ "./libs/common/src/constants/error-messages.ts":
/*!*****************************************************!*\
  !*** ./libs/common/src/constants/error-messages.ts ***!
  \*****************************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ERROR_MESSAGES = void 0;
exports.ERROR_MESSAGES = {
    INVALID_CREDENTIALS: 'Invalid email or password',
    USER_NOT_FOUND: 'User not found',
    EMAIL_ALREADY_EXISTS: 'Email already exists',
    UNAUTHORIZED: 'Unauthorized access',
    PRODUCT_NOT_FOUND: 'Product not found',
    CATEGORY_NOT_FOUND: 'Category not found',
    INSUFFICIENT_STOCK: 'Insufficient stock for this product',
    CART_NOT_FOUND: 'Cart not found',
    ORDER_NOT_FOUND: 'Order not found',
    ORDER_ALREADY_PAID: 'Order has already been paid',
    PAYMENT_FAILED: 'Payment failed',
    INVALID_PAYMENT_METHOD: 'Invalid payment method',
    BAD_REQUEST: 'Invalid data provided',
    FORBIDDEN: 'You do not have permission for this action',
    INTERNAL_SERVER_ERROR: 'Something went wrong',
};


/***/ }),

/***/ "./libs/common/src/constants/event-pattern.ts":
/*!****************************************************!*\
  !*** ./libs/common/src/constants/event-pattern.ts ***!
  \****************************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ADDRESS_EVENTS = exports.EVENT_PATTERNS = void 0;
exports.EVENT_PATTERNS = {
    USER_REGISTERED: 'user_registered',
    USER_LOGGED_IN: 'user_logged_in',
    USER_UPDATED: 'user_updated',
    PRODUCT_CREATED: 'product_created',
    PRODUCT_UPDATED: 'product_updated',
    PRODUCT_DELETED: 'product_deleted',
    CATEGORY_CREATED: 'category_created',
    INVENTORY_RESERVE: 'inventory_reserve',
    INVENTORY_RESTOCK: 'inventory_restock',
    INVENTORY_DEDUCT: 'inventory_deduct',
    CART_UPDATED: 'cart_updated',
    ORDER_CREATED: 'order_created',
    ORDER_PAID: 'order_paid',
    ORDER_CANCELLED: 'order_cancelled',
    ORDER_SHIPPED: 'order_shipped',
    PAYMENT_INITIATED: 'payment_initiated',
    PAYMENT_SUCCESS: 'payment_success',
    PAYMENT_FAILED: 'payment_failed',
    SEND_EMAIL: 'send_email',
    SEND_SMS: 'send_sms',
};
exports.ADDRESS_EVENTS = {
    CREATED: 'address_created',
    UPDATED: 'address_updated',
    DELETED: 'address_deleted',
};


/***/ }),

/***/ "./libs/common/src/constants/index.ts":
/*!********************************************!*\
  !*** ./libs/common/src/constants/index.ts ***!
  \********************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__webpack_require__(/*! ./constants */ "./libs/common/src/constants/constants.ts"), exports);
__exportStar(__webpack_require__(/*! ./error-messages */ "./libs/common/src/constants/error-messages.ts"), exports);
__exportStar(__webpack_require__(/*! ./event-pattern */ "./libs/common/src/constants/event-pattern.ts"), exports);


/***/ }),

/***/ "./libs/common/src/filters/rpc-exception.filter.ts":
/*!*********************************************************!*\
  !*** ./libs/common/src/filters/rpc-exception.filter.ts ***!
  \*********************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RpcExceptionFilterMicroservice = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const rxjs_1 = __webpack_require__(/*! rxjs */ "rxjs");
const microservices_1 = __webpack_require__(/*! @nestjs/microservices */ "@nestjs/microservices");
let RpcExceptionFilterMicroservice = class RpcExceptionFilterMicroservice {
    catch(exception, host) {
        return (0, rxjs_1.throwError)(() => exception);
    }
};
exports.RpcExceptionFilterMicroservice = RpcExceptionFilterMicroservice;
exports.RpcExceptionFilterMicroservice = RpcExceptionFilterMicroservice = __decorate([
    (0, common_1.Catch)(microservices_1.RpcException)
], RpcExceptionFilterMicroservice);


/***/ }),

/***/ "@nestjs/common":
/*!*********************************!*\
  !*** external "@nestjs/common" ***!
  \*********************************/
/***/ ((module) => {

module.exports = require("@nestjs/common");

/***/ }),

/***/ "@nestjs/core":
/*!*******************************!*\
  !*** external "@nestjs/core" ***!
  \*******************************/
/***/ ((module) => {

module.exports = require("@nestjs/core");

/***/ }),

/***/ "@nestjs/microservices":
/*!****************************************!*\
  !*** external "@nestjs/microservices" ***!
  \****************************************/
/***/ ((module) => {

module.exports = require("@nestjs/microservices");

/***/ }),

/***/ "rxjs":
/*!***********************!*\
  !*** external "rxjs" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("rxjs");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;
/*!********************************!*\
  !*** ./apps/order/src/main.ts ***!
  \********************************/

Object.defineProperty(exports, "__esModule", ({ value: true }));
const core_1 = __webpack_require__(/*! @nestjs/core */ "@nestjs/core");
const order_module_1 = __webpack_require__(/*! ./order.module */ "./apps/order/src/order.module.ts");
const microservices_1 = __webpack_require__(/*! @nestjs/microservices */ "@nestjs/microservices");
const constants_1 = __webpack_require__(/*! common/constants */ "./libs/common/src/constants/index.ts");
const rpc_exception_filter_1 = __webpack_require__(/*! common/filters/rpc-exception.filter */ "./libs/common/src/filters/rpc-exception.filter.ts");
async function bootstrap() {
    const app = await core_1.NestFactory.createMicroservice(order_module_1.OrderModule, {
        transport: microservices_1.Transport.RMQ,
        options: {
            urls: [process.env.RabbitMQ_URL || 'amqp://localhost:5672'],
            queue: constants_1.QUEUES.ORDER_QUEUE,
            queueOptions: {
                durable: false
            },
        },
    });
    app.useGlobalFilters(new rpc_exception_filter_1.RpcExceptionFilterMicroservice());
    await app.listen();
}
bootstrap();

})();

/******/ })()
;