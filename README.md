# E-Commerce Microservices Platform

A production-ready, scalable e-commerce platform built with microservices architecture using NestJS, TypeScript, Docker, and RabbitMQ.

## 🏗️ Architecture

This project implements a fully distributed microservices architecture with:

- **8 Core Microservices**: Auth, Cart, Order, Product, Inventory, Payment, Notifications, API Gateway
- **Message Queue**: RabbitMQ for inter-service communication
- **Databases**: PostgreSQL (relational data), MongoDB (product catalog), Redis (caching & sessions)
- **Payment Integration**: Stripe payment processing
- **API Gateway**: Unified entry point with circuit breakers and rate limiting

## 🚀 Features

### Authentication & Authorization
- User registration and login with JWT tokens
- Password reset and change functionality
- Token refresh mechanism
- Session management with Redis
- User profile management

### Product Management
- Product CRUD operations
- Category management
- Product search and filtering
- Slug-based routing
- Stock availability tracking

### Shopping Cart
- Add/remove items from cart
- Update item quantities
- Automatic cart clearing after order completion
- Real-time cart synchronization

### Order Management
- Order creation with payment processing
- Order status tracking (PENDING → PAID → SHIPPED → DELIVERED)
- Order cancellation
- Order history
- Email notifications

### Inventory Management
- Real-time stock tracking
- Stock reservation system
- Stock release on order cancellation
- Low stock alerts

### Payment Processing
- Stripe integration
- Secure payment handling
- Payment verification
- Refund support

## 📋 Prerequisites

- **Node.js** >= 18.x
- **Docker** and **Docker Compose**
- **npm** or **yarn**
- **Stripe Account** (for payment processing)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/faniyi-akinbobola/E-commerce-microservices.git
   cd E-commerce-microservices
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create `.env` files in the root directory:
   ```env
   # JWT Configuration
   JWT_SECRET=your_jwt_secret_key_here
   JWT_REFRESH_SECRET=your_refresh_secret_key_here
   
   # Stripe Configuration
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   
   # RabbitMQ Configuration
   RABBITMQ_URL=amqp://rabbitmq:5672
   
   # Redis Configuration
   REDIS_HOST=redis
   REDIS_PORT=6379
   
   # Database URLs
   AUTH_DATABASE_URL=postgresql://postgres:postgres@auth-db:5432/auth_db
   CART_DATABASE_URL=postgresql://postgres:postgres@cart-db:5432/cart_db
   ORDER_DATABASE_URL=postgresql://postgres:postgres@order-db:5432/order_db
   INVENTORY_DATABASE_URL=postgresql://postgres:postgres@inventory-db:5432/inventory_db
   PRODUCT_DATABASE_URL=mongodb://product-db:27017/product_db
   
   # Email Configuration (for notifications)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_app_password
   ```

4. **Start the services**
   ```bash
   docker-compose up -d
   ```

5. **Verify services are running**
   ```bash
   docker-compose ps
   ```

## 🎯 API Endpoints

The API Gateway runs on `http://localhost:3000` and exposes the following routes:

### Authentication (`/v1/auth`)
- `POST /signup` - Register new user
- `POST /login` - User login
- `POST /refreshtoken` - Refresh access token
- `POST /forgotpassword` - Request password reset
- `POST /resetpassword` - Reset password
- `POST /changepassword` - Change password (authenticated)
- `POST /signout` - Logout user
- `GET /getprofile` - Get user profile

### Users (`/v1/users`)
- `GET /getusers` - Get all users
- `GET /getuser/:id` - Get user by ID
- `PATCH /updateuser` - Update user profile
- `DELETE /deleteuser` - Delete own account
- `DELETE /deleteuser/:id` - Delete user by ID

### User Addresses (`/v1/users-address`)
- `POST /createuseraddress` - Create address
- `GET /getuseraddresses` - Get all user addresses
- `GET /getuseraddressbyid/:id` - Get address by ID
- `PATCH /updateuseraddress/:id` - Update address
- `DELETE /deleteuseraddress/:id` - Delete address

### Products (`/v1/product`)
- `POST /createproduct` - Create product
- `GET /getproducts` - Get all products
- `GET /getproduct/:id` - Get product by ID
- `GET /getproductsbyslug/:slug` - Get product by slug
- `GET /getavailableproducts` - Get available products
- `PATCH /updateproduct` - Update product
- `DELETE /deleteproduct/:id` - Delete product
- `GET /getproductsbycategory/:slug` - Get products by category

### Categories (`/v1/product`)
- `POST /createcategory` - Create category
- `GET /getcategories` - Get all categories
- `GET /getcategory/:id` - Get category by ID
- `GET /getcategoriesbyslug/:slug` - Get category by slug
- `PATCH /updatecategory/:id` - Update category
- `DELETE /deletecategory/:id` - Delete category

### Inventory (`/v1/inventory`)
- `POST /createinventory` - Create inventory record
- `GET /getinventoryforproduct/:id` - Get inventory for product
- `GET /getavailableproducts` - Get products with stock
- `PATCH /updateinventory/:productId` - Update inventory
- `POST /addstock` - Add stock
- `POST /reducestock` - Reduce stock
- `POST /reservestock` - Reserve stock
- `POST /releasestock` - Release reserved stock

### Cart (`/v1/cart`)
- `POST /addtocart` - Add item to cart
- `GET /getcart` - Get user's cart
- `PATCH /updatecartitem/:productId` - Update cart item quantity
- `DELETE /removecartitem/:productId` - Remove item from cart
- `DELETE /clearcart` - Clear entire cart

### Orders (`/v1/orders`)
- `POST /` - Create new order
- `GET /` - Get user's orders
- `GET /all` - Get all orders
- `GET /:id` - Get order by ID
- `PATCH /:id/cancel` - Cancel order
- `PATCH /:id/status` - Update order status

## 🧪 Testing

### Run Unit Tests
```bash
npm test
```

### Run E2E Tests
```bash
npm run test:e2e
```

### Run Tests with Coverage
```bash
npm run test:cov
```

### Test Results
- ✅ 208 Unit Tests Passing
- ✅ 28 E2E Tests Passing
- ✅ All 51 API Routes Working

## 🏃 Usage Example

### 1. Register a User
```bash
curl -X POST http://localhost:3000/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:3000/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

### 3. Add Item to Cart
```bash
curl -X POST http://localhost:3000/v1/cart/addtocart \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "productId": "PRODUCT_ID",
    "quantity": 2
  }'
```

### 4. Create Order
```bash
curl -X POST http://localhost:3000/v1/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "shippingAddressId": "ADDRESS_ID",
    "charge": {
      "amount": 5000,
      "card": {
        "number": "4242424242424242",
        "exp_month": 12,
        "exp_year": 2028,
        "cvc": "123"
      }
    }
  }'
```

## 🔧 Technology Stack

### Backend
- **NestJS** - Progressive Node.js framework
- **TypeScript** - Type-safe JavaScript
- **RabbitMQ** - Message broker for microservices communication
- **Redis** - Caching and session storage
- **PostgreSQL** - Relational database
- **MongoDB** - Document database for products
- **TypeORM** - ORM for PostgreSQL
- **Mongoose** - ODM for MongoDB

### Infrastructure
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Opossum** - Circuit breaker pattern implementation
- **Express Rate Limit** - API rate limiting
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing

### Payment & Notifications
- **Stripe** - Payment processing
- **Nodemailer** - Email notifications

### Testing
- **Jest** - Testing framework
- **Supertest** - HTTP assertions

## 📊 System Design Patterns

### Circuit Breaker Pattern
All inter-service communications use circuit breakers to prevent cascading failures:
- Automatic failover
- Configurable timeout and error thresholds
- Self-healing with exponential backoff

### Idempotency
POST operations implement idempotency to prevent duplicate requests:
- Redis-based idempotency key tracking
- Automatic request deduplication
- Configurable TTL for idempotency keys

### Rate Limiting
API Gateway implements rate limiting to prevent abuse:
- Per-endpoint rate limits
- IP-based throttling
- Configurable time windows

### Caching Strategy
Multi-level caching for optimal performance:
- Redis for session data and frequently accessed data
- In-memory caching for configuration
- Database query result caching

## 🐳 Docker Services

| Service | Port | Description |
|---------|------|-------------|
| API Gateway | 3000 | Main entry point |
| Auth Service | 3001 | Authentication & users |
| Cart Service | 3002 | Shopping cart |
| Order Service | 3003 | Order management |
| Product Service | 3004 | Product catalog |
| Inventory Service | 3005 | Stock management |
| Payment Service | 3006 | Payment processing |
| Notifications Service | 3007 | Email notifications |
| RabbitMQ | 5672, 15672 | Message queue & management |
| Redis | 6379 | Cache & sessions |
| PostgreSQL (Auth) | 5432 | Auth database |
| PostgreSQL (Cart) | 5433 | Cart database |
| PostgreSQL (Order) | 5434 | Order database |
| PostgreSQL (Inventory) | 5435 | Inventory database |
| MongoDB (Product) | 27017 | Product database |

## 🔐 Security Features

- JWT-based authentication with refresh tokens
- Password hashing with bcrypt
- Token blacklisting on logout
- CORS configuration
- Helmet security headers
- Rate limiting per endpoint
- SQL injection prevention via ORM
- Input validation with class-validator
- Environment variable security

## 📈 Monitoring & Logging

- Structured logging with Winston
- Request/response logging
- Error tracking and reporting
- Circuit breaker status monitoring
- Service health checks

## 🚧 Known Issues & Limitations

- None currently - all 51 routes tested and working ✅

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Akinbobola Faniyi**
- GitHub: [@faniyi-akinbobola](https://github.com/faniyi-akinbobola)

## 🙏 Acknowledgments

- NestJS team for the amazing framework
- Stripe for payment processing
- Open source community

## 📞 Support

For support, email your-email@example.com or open an issue in the repository.

---

**⭐ If you find this project useful, please consider giving it a star!**
