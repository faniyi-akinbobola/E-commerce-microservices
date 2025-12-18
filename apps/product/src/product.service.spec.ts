import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from './product.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Category } from './entities/category.entity';
import { Repository } from 'typeorm';
import { RpcException } from '@nestjs/microservices';
import { ObjectId } from 'mongodb';

describe('ProductService', () => {
  let service: ProductService;
  let productRepository: jest.Mocked<Repository<Product>>;
  let categoryRepository: jest.Mocked<Repository<Category>>;

  // Valid 24-character hex string ObjectIds
  const validProductId = new ObjectId().toString();
  const validCategoryId = new ObjectId().toString();
  const validCategoryId2 = new ObjectId().toString();

  const mockProduct = {
    _id: new ObjectId(validProductId),
    name: 'Test Product',
    description: 'A test product',
    price: 100,
    stock: 50,
    slug: 'test-product',
    categories: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCategory = {
    _id: new ObjectId(validCategoryId),
    name: 'Test Category',
    description: 'A test category',
    slug: 'test-category',
    products: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockProductRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    remove: jest.fn(),
  };

  const mockCategoryRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findByIds: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: getRepositoryToken(Product),
          useValue: mockProductRepository,
        },
        {
          provide: getRepositoryToken(Category),
          useValue: mockCategoryRepository,
        },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
    productRepository = module.get(getRepositoryToken(Product));
    categoryRepository = module.get(getRepositoryToken(Category));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createProduct', () => {
    it('should create a new product', async () => {
      const dto = {
        name: 'Test Product',
        description: 'A test product',
        price: 100,
        stock: 50,
        categoryIds: [validCategoryId],
      };

      // Mock the checks for existing product and categories
      mockProductRepository.findOneBy.mockResolvedValue(null);
      mockCategoryRepository.find.mockResolvedValue([mockCategory] as any);
      mockProductRepository.create.mockReturnValue(mockProduct as any);
      mockProductRepository.save.mockResolvedValue(mockProduct as any);

      const result = await service.createProduct(dto as any);

      expect(mockProductRepository.findOneBy).toHaveBeenCalledWith({ name: dto.name });
      expect(mockProductRepository.create).toHaveBeenCalled();
      expect(mockProductRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockProduct);
    });

    it('should throw error if categories not found', async () => {
      const dto = {
        name: 'Test Product',
        description: 'A test product',
        price: 100,
        stock: 50,
        categoryIds: ['category-999'],
      };

      mockCategoryRepository.findByIds.mockResolvedValue([]);

      await expect(service.createProduct(dto as any)).rejects.toThrow(RpcException);
    });
  });

  describe('getProducts', () => {
    it('should retrieve all products', async () => {
      const products = [mockProduct];
      mockProductRepository.find.mockResolvedValue(products as any);

      const result = await service.getProducts();

      expect(mockProductRepository.find).toHaveBeenCalled();
      expect(result).toEqual(products);
    });
  });

  describe('getProductById', () => {
    it('should retrieve a product by ID', async () => {
      mockProductRepository.findOne.mockResolvedValue(mockProduct as any);

      const result = await service.getProductById(validProductId);

      expect(mockProductRepository.findOne).toHaveBeenCalled();
      expect(result).toEqual(mockProduct);
    });

    it('should throw error if product not found', async () => {
      mockProductRepository.findOne.mockResolvedValue(null);
      const nonExistentId = new ObjectId().toString();

      await expect(service.getProductById(nonExistentId)).rejects.toThrow(RpcException);
    });
  });

  describe('updateProduct', () => {
    it('should update a product', async () => {
      const dto = {
        name: 'Updated Product',
        price: 150,
      };

      mockProductRepository.findOne.mockResolvedValue(mockProduct as any);
      mockProductRepository.save.mockResolvedValue({
        ...mockProduct,
        ...dto,
      } as any);

      const result = await service.updateProduct(validProductId, dto as any);

      expect(mockProductRepository.save).toHaveBeenCalled();
      expect(result.name).toBe(dto.name);
      expect(result.price).toBe(dto.price);
    });

    it('should throw error if product not found', async () => {
      const dto = {
        name: 'Updated Product',
      };

      mockProductRepository.findOne.mockResolvedValue(null);
      const nonExistentId = new ObjectId().toString();

      await expect(service.updateProduct(nonExistentId, dto as any)).rejects.toThrow(RpcException);
    });
  });

  describe('deleteProduct', () => {
    it('should delete a product', async () => {
      mockProductRepository.findOne.mockResolvedValue(mockProduct as any);
      mockProductRepository.remove.mockResolvedValue(mockProduct as any);

      const result = await service.deleteProduct(validProductId);

      expect(mockProductRepository.findOne).toHaveBeenCalled();
      expect(mockProductRepository.remove).toHaveBeenCalledWith(mockProduct);
      expect(result).toEqual(mockProduct);
    });

    it('should throw error if product not found', async () => {
      mockProductRepository.findOne.mockResolvedValue(null);
      const nonExistentId = new ObjectId().toString();

      await expect(service.deleteProduct(nonExistentId)).rejects.toThrow(RpcException);
    });
  });

  describe('createCategory', () => {
    it('should create a new category', async () => {
      const dto = {
        name: 'Test Category',
        description: 'A test category',
      };

      mockCategoryRepository.findOneBy.mockResolvedValue(null);
      mockCategoryRepository.create.mockReturnValue(mockCategory as any);
      mockCategoryRepository.save.mockResolvedValue(mockCategory as any);

      const result = await service.createCategory(dto as any);

      expect(mockCategoryRepository.findOneBy).toHaveBeenCalled();
      expect(mockCategoryRepository.create).toHaveBeenCalled();
      expect(mockCategoryRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockCategory);
    });
  });

  describe('getCategories', () => {
    it('should retrieve all categories', async () => {
      const categories = [mockCategory];
      mockCategoryRepository.find.mockResolvedValue(categories as any);

      const result = await service.getCategories();

      expect(mockCategoryRepository.find).toHaveBeenCalled();
      expect(result).toEqual(categories);
    });
  });

  describe('updateCategory', () => {
    it('should update a category', async () => {
      const dto = {
        name: 'Updated Category',
      };

      mockCategoryRepository.findOne.mockResolvedValue(mockCategory as any);
      mockCategoryRepository.save.mockResolvedValue({
        ...mockCategory,
        ...dto,
      } as any);

      const result = await service.updateCategory(validCategoryId, dto as any);

      expect(mockCategoryRepository.save).toHaveBeenCalled();
      expect(result.name).toBe(dto.name);
    });

    it('should throw error if category not found', async () => {
      const dto = {
        name: 'Updated Category',
      };

      mockCategoryRepository.findOne.mockResolvedValue(null);
      const nonExistentId = new ObjectId().toString();

      await expect(service.updateCategory(nonExistentId, dto as any)).rejects.toThrow(RpcException);
    });
  });

  describe('deleteCategory', () => {
    it('should delete a category', async () => {
      mockCategoryRepository.findOne.mockResolvedValue(mockCategory as any);
      mockCategoryRepository.remove.mockResolvedValue(mockCategory as any);

      const result = await service.deleteCategory(validCategoryId);

      expect(mockCategoryRepository.findOne).toHaveBeenCalled();
      expect(mockCategoryRepository.remove).toHaveBeenCalledWith(mockCategory);
      expect(result).toEqual(mockCategory);
    });

    it('should throw error if category not found', async () => {
      mockCategoryRepository.findOne.mockResolvedValue(null);
      const nonExistentId = new ObjectId().toString();

      await expect(service.deleteCategory(nonExistentId)).rejects.toThrow(RpcException);
    });
  });
});
