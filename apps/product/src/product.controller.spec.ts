import { Test, TestingModule } from '@nestjs/testing';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';

describe('ProductController', () => {
  let productController: ProductController;

  const productServiceMock = {
    createProduct: jest.fn().mockImplementation((body) => body),
    getProducts: jest.fn().mockImplementation(() => []),
    getProductsBySlug: jest.fn().mockImplementation((slug) => ({ slug })),
    getProductById: jest.fn().mockImplementation((id) => ({ id })),
    getAvailableProducts: jest.fn().mockImplementation(() => []),
    updateProduct: jest.fn().mockImplementation((id, body) => ({ id, ...body })),
    deleteProduct: jest.fn().mockImplementation((id) => ({ id })),
    getProductsByCategory: jest.fn().mockImplementation((slug) => ({ slug })),
    createCategory: jest.fn().mockImplementation((body) => body),
    getCategories: jest.fn().mockImplementation(() => []),
    updateCategory: jest.fn().mockImplementation((id, body) => ({ id, ...body })),
    deleteCategory: jest.fn().mockImplementation((id) => ({ id })),
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [ProductService],
    })
      .overrideProvider(ProductService)
      .useValue(productServiceMock)
      .compile();

    productController = app.get<ProductController>(ProductController);
  });

  describe('root', () => {
    it('should be defined', () => {
      expect(productController).toBeDefined();
    });
  });

  describe('createProduct', () => {
    it('should create a product', () => {
      const dto = {
        name: 'Product1',
        description: 'A test product',
        price: 100,
        stock: 50,
        categoryIds: ['cat1', 'cat2'],
      };
      expect(productController.createProduct(dto)).toEqual(dto);
      expect(productServiceMock.createProduct).toHaveBeenCalledWith(dto);
    });
  });

  describe('getProducts', () => {
    it('should return an array of products', () => {
      expect(productController.getProducts()).toEqual([]);
      expect(productServiceMock.getProducts).toHaveBeenCalled();
    });
  });

  describe('getProductById', () => {
    it('should return a product by ID', () => {
      expect(productController.getProductById({ id: 'product1' })).toEqual({ id: 'product1' });
      expect(productServiceMock.getProductById).toHaveBeenCalledWith('product1');
    });
  });

  describe('deleteProduct', () => {
    it('should delete a product by ID', () => {
      expect(productController.deleteProduct({ id: 'product1' })).toEqual({ id: 'product1' });
      expect(productServiceMock.deleteProduct).toHaveBeenCalledWith('product1');
    });
  });

  describe('getProductsByCategory', () => {
    it('should return products by category slug', () => {
      expect(productController.getProductsByCategory({ slug: 'category1' })).toEqual({
        slug: 'category1',
      });
      expect(productServiceMock.getProductsByCategory).toHaveBeenCalledWith('category1');
    });
  });

  describe('createCategory', () => {
    it('should create a category', () => {
      const dto = { name: 'Category1', description: 'A test category' };
      expect(productController.createCategory(dto)).toEqual(dto);
      expect(productServiceMock.createCategory).toHaveBeenCalledWith(dto);
    });
  });

  describe('getAllCategories', () => {
    it('should return an array of categories', () => {
      expect(productController.getAllCategories()).toEqual([]);
      expect(productServiceMock.getCategories).toHaveBeenCalled();
    });
  });

  describe('deleteCategory', () => {
    it('should delete a category by ID', () => {
      expect(productController.deleteCategory({ id: 'category1' })).toEqual({ id: 'category1' });
      expect(productServiceMock.deleteCategory).toHaveBeenCalledWith('category1');
    });
  });

  describe('updateCategory', () => {
    it('should update a category', () => {
      const dto = { name: 'UpdatedCategory' };
      expect(productController.updateCategory({ id: 'category1', ...dto })).toEqual({
        id: 'category1',
        ...dto,
      });
      expect(productServiceMock.updateCategory).toHaveBeenCalledWith('category1', dto);
    });
  });

  describe('updateProduct', () => {
    it('should update a product', () => {
      const dto = { name: 'UpdatedProduct', price: 150 };
      expect(productController.updateProduct({ id: 'product1', ...dto })).toEqual({
        id: 'product1',
        ...dto,
      });
      expect(productServiceMock.updateProduct).toHaveBeenCalledWith('product1', dto);
    });
  });

  describe('getAvailableProducts', () => {
    it('should return available products', () => {
      expect(productController.getAvailableProducts()).toEqual([]);
      expect(productServiceMock.getAvailableProducts).toHaveBeenCalled();
    });
  });

  describe('getProductsBySlug', () => {
    it('should return products by slug', () => {
      expect(productController.getProductsBySlug('sample-slug')).toEqual({ slug: 'sample-slug' });
      expect(productServiceMock.getProductsBySlug).toHaveBeenCalledWith('sample-slug');
    });
  });
});
