export const EVENT_PATTERNS = {
  // Auth
  USER_REGISTERED: 'user_registered',
  USER_LOGGED_IN: 'user_logged_in',
  USER_UPDATED: 'user_updated',

  // Products
  PRODUCT_CREATED: 'product_created',
  PRODUCT_UPDATED: 'product_updated',
  PRODUCT_DELETED: 'product_deleted',

  // Categories
  CATEGORY_CREATED: 'category_created',

  // Inventory
  INVENTORY_RESERVE: 'inventory_reserve',
  INVENTORY_RESTOCK: 'inventory_restock',
  INVENTORY_DEDUCT: 'inventory_deduct',

  // Cart
  CART_UPDATED: 'cart_updated',

  // Orders
  ORDER_CREATED: 'order_created',
  ORDER_PAID: 'order_paid',
  ORDER_CANCELLED: 'order_cancelled',
  ORDER_SHIPPED: 'order_shipped',

  // Payments
  PAYMENT_INITIATED: 'payment_initiated',
  PAYMENT_SUCCESS: 'payment_success',
  PAYMENT_FAILED: 'payment_failed',

  // Notifications
  SEND_EMAIL: 'send_email',
  SEND_SMS: 'send_sms',
};

export const ADDRESS_EVENTS = {
  CREATED: 'address_created',
  UPDATED: 'address_updated',
  DELETED: 'address_deleted',
};
