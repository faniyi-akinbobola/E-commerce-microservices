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
    const category = await this.categoryRepository.findOne({where: {_id: id}});
    if (!category) {
      throw new RpcException('Category not found');
    }
    return this.categoryRepository.remove(category);
  }

  async updateCategory(id:string, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    throw new Error('Method not implemented.');
    const category = await this.categoryRepository.findOne({where: {_id: id}});
    if (!category) {
      throw new RpcException('Category not found');
    }
    Object.assign(category, updateCategoryDto);
    return this.categoryRepository.save(category);
  }

  async getCategoryById(id: string): Promise<Category> {
    const category = await this.categoryRepository.findOne({where: {_id: id}});
    if (!category) {
      throw new RpcException('Category not found');
    }
    return category;
  }

  async getCategoriesByIds(ids: string[]): Promise<Category[]> {
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
    const category = await this.categoryRepository.findOne({where: {slug}});
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

    const existingcategory = await this.categoryRepository.findOne({ where: [
      
        {name : createCategoryDto.name},
        {description : createCategoryDto.description}

       ]});

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
    const existingProduct = await this.productRepository.findOne({
      where: { name: createProductDto.name }
    });

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

  
  async getAvailableProducts() {
    throw new Error('Method not implemented.');
  }
  async getProductsBySlug() {
    throw new Error('Method not implemented.');
  }
  async getProductsByCategory() {
    throw new Error('Method not implemented.');
  }
  async deleteProduct() {
    throw new Error('Method not implemented.');
  }
  async replaceProduct() {
    throw new Error('Method not implemented.');
  }
  async updateProduct() {
    throw new Error('Method not implemented.');
  }
  async getProductById() {
    throw new Error('Method not implemented.');
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

