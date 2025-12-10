import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateProductDto, UpdateProductDto, CreateCategoryDto, UpdateCategoryDto } from '@apps/common';
import { generateSku, generateSlug } from '@apps/common'; 
import { RpcException } from '@nestjs/microservices';
import { ObjectId } from 'mongodb';

@Injectable()
export class ProductService {

   constructor(@InjectRepository(Product) private readonly productRepository: Repository<Product>,
    @InjectRepository(Category) private readonly categoryRepository: Repository<Category>){}


// category methods
 async deleteCategory(id: string) : Promise<Category> {
    const category = await this.categoryRepository.findOne({where: {_id: new ObjectId(id)} as any});
    if (!category) {
      throw new RpcException('Category not found');
    }
    return this.categoryRepository.remove(category);
  }

  async updateCategory(id:string, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    const category = await this.categoryRepository.findOne({where: {_id: new ObjectId(id)} as any});
    if (!category) {
      throw new RpcException('Category not found');
    }
    
    // If name is being updated, regenerate slug
    if (updateCategoryDto.name && updateCategoryDto.name !== category.name) {
      const slug = generateSlug(updateCategoryDto.name);
      Object.assign(category, updateCategoryDto, { slug });
    } else {
      Object.assign(category, updateCategoryDto);
    }
    
    return this.categoryRepository.save(category);
  }

  async getCategoryById(id: string): Promise<Category> {
    const category = await this.categoryRepository.findOne({where: {_id: new ObjectId(id)} as any});
    if (!category) {
      throw new RpcException('Category not found');
    }
    return category;
  }

  // service-only method
  async getCategoriesByIds(ids: string[]): Promise<Category[]> {
    // Validate all IDs are valid MongoDB ObjectIds
    const invalidIds = ids.filter(id => !ObjectId.isValid(id));
    if (invalidIds.length > 0) {
      throw new RpcException(`Invalid category ID format: ${invalidIds.join(', ')}`);
    }

    const objectIds = ids.map(id => new ObjectId(id));
    const categories = await this.categoryRepository.find({
      where: {
        _id: { $in: objectIds } as any
      }
    });
    if (!categories || categories.length === 0) {
      throw new RpcException('No categories found');
    }
    if (categories.length !== ids.length) {
      throw new RpcException('One or more categories do not exist');
    }
    return categories;
  }

  async getCategoriesBySlug(slug: string) {
    const category = await this.categoryRepository.findOneBy({slug} as any);
    if (!category) {
      throw new RpcException('Category not found');
    }
    return category;
  }

  async getCategories(): Promise<Category[]> {
    const categories = await this.categoryRepository.find();
    if (!categories || categories.length === 0) {
      throw new RpcException('No categories found');
    }
    return categories;
  }

  async createCategory(createCategoryDto: CreateCategoryDto): Promise<Category> {

    const existingcategory = await this.categoryRepository.findOneBy({name: createCategoryDto.name} as any);

      if(existingcategory){
        throw new RpcException('Category already exists');
      }

      const slug = generateSlug(createCategoryDto.name);

      const now = new Date();
      const category = this.categoryRepository.create({
        ...createCategoryDto,
        slug,
        createdAt: now,
      });

      return this.categoryRepository.save(category);
  
  }

  // product methods

  async createProduct(createProductDto: CreateProductDto): Promise<Product> {
    // Verify all category IDs exist
    if (createProductDto.categoryIds && createProductDto.categoryIds.length > 0) {
      await this.getCategoriesByIds(createProductDto.categoryIds);
    }

    // Check if product with same name already exists
    const existingProduct = await this.productRepository.findOneBy({name: createProductDto.name} as any);

    if (existingProduct) {
      throw new RpcException('Product with this name already exists');
    }

    // Generate SKU and slug
    const sku = generateSku();
    const slug = generateSlug(createProductDto.name);

    // Convert categoryIds to ObjectIds
    const categoryObjectIds = createProductDto.categoryIds.map(id => new ObjectId(id));

    const now = new Date();
    const product = this.productRepository.create({
      ...createProductDto,
      categoryIds: categoryObjectIds,
      sku,
      slug,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    return this.productRepository.save(product);
  }

  
  async getAvailableProducts() : Promise<Product[]> {
    const products = await this.productRepository.find();
    if (!products || products.length === 0) {
      throw new RpcException('No products found');
    }
    return products.filter(product => product.isActive);
  }

  async getProductsBySlug(slug : string): Promise<Product> {
    const product = await this.productRepository.findOneBy({slug} as any);
    if (!product) {
      throw new RpcException('Product not found');
    }
    return product;
  }

  async getProductsByCategory(slug: string) : Promise<Product[]> {
    const category = await this.categoryRepository.findOneBy({slug} as any);
    if (!category) {
      throw new RpcException('Category not found');
    }
    const products = await this.productRepository.find({
      where: {
        categoryIds: { $in: [new ObjectId(category._id)] } as any,
        isActive: true
      }
    });
    if (!products || products.length === 0) {
      throw new RpcException('No products found for this category');
    }
    return products;
  }

  async deleteProduct(id: string): Promise<Product> {
    const product  = await this.productRepository.findOne({where: {_id: new ObjectId(id)} as any});
    if (!product) {
      throw new RpcException('Product not found');
    }
    return this.productRepository.remove(product);
  }

  async updateProduct(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.productRepository.findOne({where: {_id: new ObjectId(id)} as any});
    if (!product) {
      throw new RpcException('Product not found');
    }

    // If categoryIds are being updated, verify they all exist
    if (updateProductDto.categoryIds && updateProductDto.categoryIds.length > 0) {
      await this.getCategoriesByIds(updateProductDto.categoryIds);
      // Convert to ObjectIds
      updateProductDto.categoryIds = updateProductDto.categoryIds.map(id => new ObjectId(id)) as any;
    }
  
    Object.assign(product, updateProductDto, { updatedAt: new Date() });
    return this.productRepository.save(product);
  }

  async getProductById(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({where: {_id: new ObjectId(id)} as any});
    if (!product) {
      throw new RpcException('Product not found');
    }
    return product;
  }
  
async getProducts(categoryIds?: string[]) {
  // Ensure all provided category IDs exist
  if (categoryIds && categoryIds.length > 0) {
    const categories = await this.getCategoriesByIds(categoryIds);
    if (categories.length !== categoryIds.length) {
      throw new RpcException('One or more categories do not exist');
    }
  }

  // TODO: Implement product retrieval logic here
  // For now, just return all products
  return this.productRepository.find();
}
}

