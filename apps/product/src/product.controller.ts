import { Controller, Get, Patch, Put, Delete, Post, Body, Param } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateCategoryDto, CreateProductDto, UpdateCategoryDto, UpdateProductDto } from 'common/dtos';
import { MessagePattern, Payload } from '@nestjs/microservices';


@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}


  // admin and inventory manager only
  @MessagePattern({cmd: 'create_product'})
  createProduct(@Payload() body: CreateProductDto){
    return this.productService.createProduct(body);
  }

  @MessagePattern({cmd: 'get_all_products'})
  getProducts(){
    return this.productService.getProducts();
  }

  @MessagePattern({cmd : 'get_products_by_slug'})
  getProductsBySlug(@Payload() slug:string){
    return this.productService.getProductsBySlug(slug);
  }

  @MessagePattern({cmd: 'get_product_by_id'})
  getProductById(@Payload() {id}: {id: string}){
    return this.productService.getProductById(id);
  }

  @MessagePattern({cmd : 'get_available_products'})
  getAvailableProducts(){
    return this.productService.getAvailableProducts();
  }

  @MessagePattern({cmd: 'update_product'})
  updateProduct(@Payload() payload: { id: string } & UpdateProductDto){
    const { id, ...body } = payload;
    return this.productService.updateProduct(id, body);
  }

  @MessagePattern({cmd: 'delete_product'})
  deleteProduct(@Payload() {id}: {id: string}){
    return this.productService.deleteProduct(id);
  }

  @MessagePattern({cmd: 'get_products_by_category'})
  getProductsByCategory(@Payload() {slug} : {slug: string}){
    return this.productService.getProductsByCategory(slug);
  }

  // category routes

  @MessagePattern({cmd: 'create_category'})
  createCategory(@Payload() body: CreateCategoryDto){
    return this.productService.createCategory(body);
  }

  @MessagePattern({cmd: 'get_all_categories'})
  getAllCategories(){
    return this.productService.getCategories();
  }

  @MessagePattern({cmd: 'get_categories_by_slug'})
  getCategoriesBySlug(@Payload() {slug} : {slug: string}){
    return this.productService.getCategoriesBySlug(slug);
  }

  @MessagePattern({cmd: 'get_category_by_id'})
  getCategoryById(@Payload() {id} :{id: string}){
    return this.productService.getCategoryById(id);
  }

  @MessagePattern({cmd: 'update_category'})
  updateCategory(@Payload() payload: { id: string } & UpdateCategoryDto){
    const { id, ...body } = payload;
    return this.productService.updateCategory(id, body);
  }
  
  @MessagePattern({cmd: 'delete_category'})
  deleteCategory(@Payload() {id}: {id: string}){
    return this.productService.deleteCategory(id);
  }

}
