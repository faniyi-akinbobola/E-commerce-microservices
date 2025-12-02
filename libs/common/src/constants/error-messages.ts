export const ERROR_MESSAGES = {
  // Auth
  INVALID_CREDENTIALS: 'Invalid email or password',
  USER_NOT_FOUND: 'User not found',
  EMAIL_ALREADY_EXISTS: 'Email already exists',
  UNAUTHORIZED: 'Unauthorized access',

  // Products
  PRODUCT_NOT_FOUND: 'Product not found',
  CATEGORY_NOT_FOUND: 'Category not found',

  // Inventory
  INSUFFICIENT_STOCK: 'Insufficient stock for this product',

  // Cart
  CART_NOT_FOUND: 'Cart not found',

  // Orders
  ORDER_NOT_FOUND: 'Order not found',
  ORDER_ALREADY_PAID: 'Order has already been paid',

  // Payments
  PAYMENT_FAILED: 'Payment failed',
  INVALID_PAYMENT_METHOD: 'Invalid payment method',

  // General
  BAD_REQUEST: 'Invalid data provided',
  FORBIDDEN: 'You do not have permission for this action',
  INTERNAL_SERVER_ERROR: 'Something went wrong',
};
