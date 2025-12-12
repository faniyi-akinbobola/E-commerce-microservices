"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.USER_EVENTS = exports.ADDRESS_EVENTS = exports.EVENT_PATTERNS = void 0;
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
exports.USER_EVENTS = {
    CREATED: 'user_created',
    UPDATED: 'user_updated',
    DELETED: 'user_deleted',
};
//# sourceMappingURL=event-pattern.js.map