import {
  Controller,
  Post,
  UseGuards,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  OnModuleInit,
  Logger,
  ServiceUnavailableException,
  UseInterceptors,
} from '@nestjs/common';
import { JwtBlacklistGuard } from '../guards/jwt-blacklist.guard';
import { ClientProxy } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import {
  CreateCategoryDto,
  CreateProductDto,
  Public,
  RolesGuard,
  UpdateCategoryDto,
  UpdateProductDto,
  CircuitBreakerService,
} from '@apps/common';
import { Roles } from '@apps/common';
import { lastValueFrom, timeout } from 'rxjs';
import { IdempotencyInterceptor } from '../interceptors/idempotency.interceptor';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Products')
@UseInterceptors(IdempotencyInterceptor)
@UseGuards(JwtBlacklistGuard, RolesGuard)
@Controller({ path: 'product', version: '1' })
export class ProductController implements OnModuleInit {
  private readonly Logger = new Logger(ProductController.name);

  private createProductCircuit;
  private getProductsCircuit;
  private getProductsByIdCircuit;
  private getProductsBySlugCircuit;
  private getAvailableProductsCircuit;
  private updateProductCircuit;
  private deleteProductCircuit;
  private getProductsByCategoryCircuit;
  private createCategoryCircuit;
  private getCategoriesCircuit;
  private getCategoriesByIdCircuit;
  private updateCategoryCircuit;
  private deleteCategoryCircuit;
  private getCategoriesBySlugCircuit;

  constructor(
    @Inject('PRODUCT_SERVICE') private readonly productClient: ClientProxy,
    private readonly circuitBreakerService: CircuitBreakerService,
  ) {}

  async onModuleInit() {
    this.initializeCircuitBreakers();
  }

  private initializeCircuitBreakers() {
    this.createProductCircuit = this.circuitBreakerService.createCircuitBreaker(
      async (data: CreateProductDto) => {
        return await lastValueFrom(
          this.productClient.send({ cmd: 'create_product' }, data).pipe(timeout(10000)),
        );
      },
      {
        timeout: 10000,
        errorThresholdPercentage: 50,
        resetTimeout: 30000,
        name: 'create_product',
      },
    );

    this.createProductCircuit.fallback(() => {
      throw new ServiceUnavailableException(
        'Create product service is currently unavailable. Please try again later.',
      );
    });

    this.getProductsCircuit = this.circuitBreakerService.createCircuitBreaker(
      async () => {
        return await lastValueFrom(
          this.productClient.send({ cmd: 'get_all_products' }, {}).pipe(timeout(5000)),
        );
      },
      {
        timeout: 5000,
        errorThresholdPercentage: 50,
        resetTimeout: 30000,
        name: 'get_all_products',
      },
    );

    this.getProductsCircuit.fallback(() => {
      throw new ServiceUnavailableException(
        'Get products service is currently unavailable. Please try again later.',
      );
    });

    this.getProductsByIdCircuit = this.circuitBreakerService.createCircuitBreaker(
      async (id: string) => {
        return await lastValueFrom(
          this.productClient.send({ cmd: 'get_product_by_id' }, { id }).pipe(timeout(5000)),
        );
      },
      {
        timeout: 5000,
        errorThresholdPercentage: 50,
        resetTimeout: 30000,
        name: 'get_product_by_id',
      },
    );

    this.getProductsByIdCircuit.fallback(() => {
      throw new ServiceUnavailableException(
        'Get products by id service is currently unavailable. Please try again later.',
      );
    });

    this.getProductsBySlugCircuit = this.circuitBreakerService.createCircuitBreaker(
      async (slug: string) => {
        return await lastValueFrom(
          this.productClient.send({ cmd: 'get_products_by_slug' }, slug).pipe(timeout(5000)),
        );
      },
      {
        timeout: 5000,
        errorThresholdPercentage: 50,
        resetTimeout: 30000,
        name: 'get_products_by_slug',
      },
    );

    this.getProductsBySlugCircuit.fallback(() => {
      throw new ServiceUnavailableException(
        'Get products by slug service is currently unavailable. Please try again later.',
      );
    });

    this.getAvailableProductsCircuit = this.circuitBreakerService.createCircuitBreaker(
      async () => {
        return await lastValueFrom(
          this.productClient.send({ cmd: 'get_available_products' }, {}).pipe(timeout(5000)),
        );
      },
      {
        timeout: 5000,
        errorThresholdPercentage: 50,
        resetTimeout: 30000,
        name: 'get_available_products',
      },
    );

    this.getAvailableProductsCircuit.fallback(() => {
      throw new ServiceUnavailableException(
        'Get available products service is currently unavailable. Please try again later.',
      );
    });

    this.updateProductCircuit = this.circuitBreakerService.createCircuitBreaker(
      async (data: { id: string } & UpdateProductDto) => {
        return await lastValueFrom(
          this.productClient.send({ cmd: 'update_product' }, data).pipe(timeout(5000)),
        );
      },
      {
        timeout: 10000,
        errorThresholdPercentage: 50,
        resetTimeout: 30000,
        name: 'update_product',
      },
    );

    this.updateProductCircuit.fallback(() => {
      throw new ServiceUnavailableException(
        'Update products service is currently unavailable. Please try again later.',
      );
    });

    this.deleteProductCircuit = this.circuitBreakerService.createCircuitBreaker(
      async (id: string) => {
        return await lastValueFrom(
          this.productClient.send({ cmd: 'delete_product' }, { id }).pipe(timeout(5000)),
        );
      },
      {
        timeout: 5000,
        errorThresholdPercentage: 50,
        resetTimeout: 30000,
        name: 'delete_product',
      },
    );

    this.deleteProductCircuit.fallback(() => {
      throw new ServiceUnavailableException(
        'Delete products service is currently unavailable. Please try again later.',
      );
    });

    this.getProductsByCategoryCircuit = this.circuitBreakerService.createCircuitBreaker(
      async (slug: string) => {
        return await lastValueFrom(
          this.productClient
            .send({ cmd: 'get_products_by_category' }, { slug })
            .pipe(timeout(5000)),
        );
      },
      {
        timeout: 5000,
        errorThresholdPercentage: 50,
        resetTimeout: 30000,
        name: 'get_products_by_category',
      },
    );

    this.getProductsByCategoryCircuit.fallback(() => {
      throw new ServiceUnavailableException(
        'Get products by category service is currently unavailable. Please try again later.',
      );
    });

    this.createCategoryCircuit = this.circuitBreakerService.createCircuitBreaker(
      async (data: CreateCategoryDto) => {
        return await lastValueFrom(
          this.productClient.send({ cmd: 'create_category' }, data).pipe(timeout(5000)),
        );
      },
      {
        timeout: 10000,
        errorThresholdPercentage: 50,
        resetTimeout: 30000,
        name: 'create_category',
      },
    );

    this.createCategoryCircuit.fallback(() => {
      throw new ServiceUnavailableException(
        'Create category service is currently unavailable. Please try again later.',
      );
    });

    this.getCategoriesCircuit = this.circuitBreakerService.createCircuitBreaker(
      async () => {
        return await lastValueFrom(
          this.productClient.send({ cmd: 'get_all_categories' }, {}).pipe(timeout(5000)),
        );
      },
      {
        timeout: 5000,
        errorThresholdPercentage: 50,
        resetTimeout: 30000,
        name: 'get_all_categories',
      },
    );

    this.getCategoriesCircuit.fallback(() => {
      throw new ServiceUnavailableException(
        'Get category service is currently unavailable. Please try again later.',
      );
    });

    this.getCategoriesByIdCircuit = this.circuitBreakerService.createCircuitBreaker(
      async (id: string) => {
        return await this.productClient
          .send({ cmd: 'get_category_by_id' }, { id })
          .pipe(timeout(5000));
      },
      {
        timeout: 5000,
        errorThresholdPercentage: 50,
        resetTimeout: 30000,
        name: 'get_category_by_id',
      },
    );

    this.getCategoriesByIdCircuit.fallback(() => {
      throw new ServiceUnavailableException(
        'Get categories by id service is currently unavailable. Please try again later.',
      );
    });

    this.updateCategoryCircuit = this.circuitBreakerService.createCircuitBreaker(
      async (data: { id: string } & UpdateCategoryDto) => {
        return await lastValueFrom(
          this.productClient.send({ cmd: 'update_category' }, data).pipe(timeout(5000)),
        );
      },
      {
        timeout: 10000,
        errorThresholdPercentage: 50,
        resetTimeout: 30000,
        name: 'update_category',
      },
    );

    this.updateCategoryCircuit.fallback(() => {
      throw new ServiceUnavailableException(
        'Update category service is currently unavailable. Please try again later.',
      );
    });

    this.deleteCategoryCircuit = this.circuitBreakerService.createCircuitBreaker(
      async (id: string) => {
        return await lastValueFrom(
          this.productClient.send({ cmd: 'delete_category' }, { id }).pipe(timeout(5000)),
        );
      },
      {
        timeout: 5000,
        errorThresholdPercentage: 50,
        resetTimeout: 30000,
        name: 'delete_category',
      },
    );

    this.deleteCategoryCircuit.fallback(() => {
      throw new ServiceUnavailableException(
        'Delete category service is currently unavailable. Please try again later.',
      );
    });

    this.getCategoriesBySlugCircuit = this.circuitBreakerService.createCircuitBreaker(
      async (slug: string) => {
        return await lastValueFrom(
          this.productClient.send({ cmd: 'get_categories_by_slug' }, { slug }).pipe(timeout(5000)),
        );
      },
      {
        timeout: 5000,
        errorThresholdPercentage: 50,
        resetTimeout: 30000,
        name: 'get_categories_by_slug',
      },
    );

    this.getCategoriesBySlugCircuit.fallback(() => {
      throw new ServiceUnavailableException(
        'Get categories by slug service is currently unavailable. Please try again later.',
      );
    });
  }

  // product routes
  @Roles('ADMIN', 'INVENTORY_MANAGER')
  @ApiBearerAuth('JWT-auth')
  @Post('createproduct')
  @ApiOperation({
    summary: 'Create product',
    description:
      'Create a new product with details, pricing, and inventory. Requires ADMIN or INVENTORY_MANAGER role.',
  })
  @ApiBody({ type: CreateProductDto })
  @ApiResponse({
    status: 201,
    description: 'Product created successfully',
    schema: {
      example: {
        id: 'prod_123456',
        name: 'MacBook Pro 16"',
        description: 'Powerful laptop with M3 chip, 16GB RAM, and 512GB SSD',
        price: 2499.99,
        stock: 50,
        categoryIds: ['507f1f77bcf86cd799439011'],
        brand: 'Apple',
        createdAt: '2026-01-16T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Requires ADMIN or INVENTORY_MANAGER role' })
  async createProduct(@Body() body: CreateProductDto) {
    try {
      return await this.createProductCircuit.fire(body);
    } catch (error) {
      this.Logger.error(`create product failed: ${error}`);
      throw error;
    }
  }

  @Public()
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(30)
  @Get('getproducts')
  @ApiOperation({
    summary: 'Get all products',
    description: 'Retrieve all products with their details. Public endpoint with 30-second cache.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of all products',
    schema: {
      example: [
        {
          id: 'prod_123456',
          name: 'MacBook Pro 16"',
          description: 'High-performance laptop for professionals',
          price: 2499.99,
          stock: 50,
          brand: 'Apple',
          categoryIds: ['cat_001', 'cat_002'],
          images: ['https://example.com/image1.jpg'],
          slug: 'macbook-pro-16',
          createdAt: '2026-01-16T10:00:00.000Z',
        },
      ],
    },
  })
  async getProducts() {
    try {
      return await this.getProductsCircuit.fire();
    } catch (error) {
      this.Logger.error(`get products failed: ${error}`);
      throw error;
    }
  }

  @Public()
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(30)
  @Get('getproduct/:id')
  @ApiOperation({
    summary: 'Get product by ID',
    description:
      'Retrieve detailed information for a specific product by ID. Public endpoint with 30-second cache.',
  })
  @ApiResponse({
    status: 200,
    description: 'Product details',
    schema: {
      example: {
        id: 'prod_123456',
        name: 'MacBook Pro 16"',
        description: 'High-performance laptop for professionals',
        price: 2499.99,
        stock: 50,
        brand: 'Apple',
        categoryIds: ['cat_001', 'cat_002'],
        images: ['https://example.com/image1.jpg'],
        slug: 'macbook-pro-16',
        createdAt: '2026-01-16T10:00:00.000Z',
        updatedAt: '2026-01-16T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async getProductById(@Param('id') id: string) {
    try {
      return await this.getProductsByIdCircuit.fire(id);
    } catch (error) {
      this.Logger.error(`get product by id failed: ${error}`);
      throw error;
    }
  }

  @Public()
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(30)
  @Get('getproductsbyslug/:slug')
  @ApiOperation({
    summary: 'Get product by slug',
    description: 'Retrieve product by URL-friendly slug. Public endpoint with 30-second cache.',
  })
  @ApiResponse({
    status: 200,
    description: 'Product details',
    schema: {
      example: {
        id: 'prod_123456',
        name: 'MacBook Pro 16"',
        slug: 'macbook-pro-16',
        description: 'High-performance laptop for professionals',
        price: 2499.99,
        stock: 50,
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async getProductsBySlug(@Param('slug') slug: string) {
    try {
      return await this.getProductsBySlugCircuit.fire(slug);
    } catch (error) {
      this.Logger.error(`get products by slug failed: ${error}`);
      throw error;
    }
  }

  @Public()
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(30)
  @Get('getavailableproducts')
  @ApiOperation({
    summary: 'Get available products',
    description:
      'Retrieve products that are currently in stock. Public endpoint with 30-second cache.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of available products',
    schema: {
      example: [
        {
          id: 'prod_123456',
          name: 'MacBook Pro 16"',
          price: 2499.99,
          stock: 50,
          isAvailable: true,
        },
        {
          id: 'prod_789012',
          name: 'iPhone 15 Pro',
          price: 999.99,
          stock: 150,
          isAvailable: true,
        },
      ],
    },
  })
  async getAvailableProducts() {
    try {
      return await this.getAvailableProductsCircuit.fire();
    } catch (error) {
      this.Logger.error(`get available products failed: ${error}`);
    }
  }

  @Roles('ADMIN', 'INVENTORY_MANAGER')
  @ApiBearerAuth('JWT-auth')
  @Patch('updateproduct')
  @ApiOperation({
    summary: 'Update product',
    description:
      'Update product details including name, description, price, stock, categories, images, and brand. Requires ADMIN or INVENTORY_MANAGER role.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Product ID', example: 'prod_123456' },
        name: { type: 'string', description: 'Product name', example: 'MacBook Pro 16" (Updated)' },
        description: { type: 'string', example: 'Updated description' },
        price: { type: 'number', example: 2399.99 },
        stock: { type: 'number', example: 75 },
        brand: { type: 'string', example: 'Apple' },
        categoryIds: { type: 'array', items: { type: 'string' }, example: ['cat_001'] },
        images: {
          type: 'array',
          items: { type: 'string' },
          example: ['https://example.com/new-image.jpg'],
        },
      },
      required: ['id'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Product updated successfully',
    schema: {
      example: {
        id: 'prod_123456',
        name: 'MacBook Pro 16" (Updated)',
        price: 2399.99,
        stock: 75,
        updatedAt: '2026-01-16T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async updateProduct(@Body() body: { id: string } & UpdateProductDto) {
    try {
      return await this.updateProductCircuit.fire(body);
    } catch (error) {
      this.Logger.error(`update product failed: ${error}`);
      throw error;
    }
  }

  @Roles('ADMIN', 'INVENTORY_MANAGER')
  @ApiBearerAuth('JWT-auth')
  @Delete('deleteproduct/:id')
  @ApiOperation({
    summary: 'Delete product',
    description: 'Delete a product by ID. Requires ADMIN or INVENTORY_MANAGER role.',
  })
  @ApiResponse({
    status: 200,
    description: 'Product deleted successfully',
    schema: {
      example: {
        success: true,
        message: 'Product deleted successfully',
        deletedId: 'prod_123456',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async deleteProduct(@Param('id') id: string) {
    try {
      return await this.deleteProductCircuit.fire(id);
    } catch (error) {
      this.Logger.error(`delete product failed: ${error}`);
      throw error;
    }
  }

  @Public()
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(30)
  @Get('getproductsbycategory/:slug')
  @ApiOperation({
    summary: 'Get products by category',
    description:
      'Retrieve all products in a specific category by category slug. Public endpoint with 30-second cache.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of products in category',
    schema: {
      example: {
        category: {
          id: 'cat_001',
          name: 'Electronics',
          slug: 'electronics',
        },
        products: [
          {
            id: 'prod_123456',
            name: 'MacBook Pro 16"',
            price: 2499.99,
            stock: 50,
          },
          {
            id: 'prod_789012',
            name: 'iPhone 15 Pro',
            price: 999.99,
            stock: 150,
          },
        ],
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async getProductsByCategory(@Param('slug') slug: string) {
    try {
      return await this.getProductsByCategoryCircuit.fire(slug);
    } catch (error) {
      this.Logger.error(`get products category by slug failed: ${error}`);
      throw error;
    }
  }

  // category routes
  @Roles('ADMIN', 'INVENTORY_MANAGER')
  @ApiBearerAuth('JWT-auth')
  @Post('createcategory')
  @ApiOperation({
    summary: 'Create category',
    description: 'Create a new product category. Requires ADMIN or INVENTORY_MANAGER role.',
  })
  @ApiBody({ type: CreateCategoryDto })
  @ApiResponse({
    status: 201,
    description: 'Category created successfully',
    schema: {
      example: {
        id: '507f1f77bcf86cd799439011',
        name: 'Electronics',
        description: 'Electronic devices and accessories',
        createdAt: '2026-01-16T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Requires ADMIN or INVENTORY_MANAGER role' })
  async createCategory(@Body() body: CreateCategoryDto) {
    try {
      console.log('API Gateway received body:', JSON.stringify(body));
      console.log('Body type:', typeof body);
      console.log('Body keys:', Object.keys(body || {}));
      return await this.createCategoryCircuit.fire(body);
    } catch (error) {
      this.Logger.error(`create category failed: ${error}`);
      throw error;
    }
  }

  @Public()
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(30)
  @Get('getcategories')
  @ApiOperation({
    summary: 'Get all categories',
    description: 'Retrieve all product categories. Public endpoint with 30-second cache.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of all categories',
    schema: {
      example: [
        {
          id: 'cat_001',
          name: 'Electronics',
          description: 'Electronic devices and accessories',
          slug: 'electronics',
          createdAt: '2026-01-16T10:00:00.000Z',
        },
        {
          id: 'cat_002',
          name: 'Computers',
          description: 'Laptops, desktops, and accessories',
          slug: 'computers',
          createdAt: '2026-01-16T10:00:00.000Z',
        },
      ],
    },
  })
  async getCategories() {
    try {
      return await this.getCategoriesCircuit.fire();
    } catch (error) {
      this.Logger.error(`get categories failed: ${error}`);
      throw error;
    }
  }

  @Public()
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(30)
  @Get('getcategory/:id')
  @ApiOperation({
    summary: 'Get category by ID',
    description: 'Retrieve a specific category by ID. Public endpoint with 30-second cache.',
  })
  @ApiResponse({
    status: 200,
    description: 'Category details',
    schema: {
      example: {
        id: 'cat_001',
        name: 'Electronics',
        description: 'Electronic devices and accessories',
        slug: 'electronics',
        productCount: 25,
        createdAt: '2026-01-16T10:00:00.000Z',
        updatedAt: '2026-01-16T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async getCategoryById(@Param('id') id: string) {
    try {
      return await this.getCategoriesByIdCircuit.fire(id);
    } catch (error) {
      this.Logger.error(`get category by id failed: ${error}`);
      throw error;
    }
  }

  @Roles('ADMIN', 'INVENTORY_MANAGER')
  @ApiBearerAuth('JWT-auth')
  @Patch('updatecategory/:id')
  @ApiOperation({
    summary: 'Update category',
    description: 'Update category name and description. Requires ADMIN or INVENTORY_MANAGER role.',
  })
  @ApiBody({ type: UpdateCategoryDto })
  @ApiResponse({
    status: 200,
    description: 'Category updated successfully',
    schema: {
      example: {
        id: 'cat_001',
        name: 'Electronics (Updated)',
        description: 'Updated description for electronics category',
        slug: 'electronics',
        updatedAt: '2026-01-16T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async updateCategory(@Param('id') id: string, @Body() body: UpdateCategoryDto) {
    try {
      return await this.updateCategoryCircuit.fire({ id, ...body });
    } catch (error) {
      this.Logger.error(`update category failed: ${error}`);
      throw error;
    }
  }

  @Roles('ADMIN', 'INVENTORY_MANAGER')
  @ApiBearerAuth('JWT-auth')
  @Delete('deletecategory/:id')
  @ApiOperation({
    summary: 'Delete category',
    description: 'Delete a category by ID. Requires ADMIN or INVENTORY_MANAGER role.',
  })
  @ApiResponse({
    status: 200,
    description: 'Category deleted successfully',
    schema: {
      example: {
        success: true,
        message: 'Category deleted successfully',
        deletedId: 'cat_001',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async deleteCategory(@Param('id') id: string) {
    try {
      return await this.deleteCategoryCircuit.fire(id);
    } catch (error) {
      this.Logger.error(`delete category failed: ${error}`);
      throw error;
    }
  }

  @Public()
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(30)
  @Get('getcategoriesbyslug/:slug')
  @ApiOperation({
    summary: 'Get category by slug',
    description: 'Retrieve a category by URL-friendly slug. Public endpoint with 30-second cache.',
  })
  @ApiResponse({
    status: 200,
    description: 'Category details',
    schema: {
      example: {
        id: 'cat_001',
        name: 'Electronics',
        description: 'Electronic devices and accessories',
        slug: 'electronics',
        productCount: 25,
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async getCategoriesBySlug(@Param('slug') slug: string) {
    try {
      return await this.getCategoriesBySlugCircuit.fire(slug);
    } catch (error) {
      this.Logger.error(`get categories by slug: ${error}`);
      throw error;
    }
  }
}
