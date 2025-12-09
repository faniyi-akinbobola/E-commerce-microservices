import { Controller, Post, UseGuards,Get, Patch,Delete,Param,Body } from '@nestjs/common';
import { JwtBlacklistGuard } from '../guards/jwt-blacklist.guard';
import { ClientProxy } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { CreateCategoryDto, CreateProductDto, Public, RolesGuard, UpdateCategoryDto, UpdateProductDto } from '@apps/common';
import { Roles } from '@apps/common';


@UseGuards(JwtBlacklistGuard, RolesGuard)
@Controller('product')
export class ProductController {
    constructor(@Inject('PRODUCT_SERVICE') private readonly productClient: ClientProxy){}
    
    // product routes
    @Roles('ADMIN', 'INVENTORY_MANAGER')
    @Post('createproduct')
    createProduct(@Body() body: CreateProductDto){
        return this.productClient.send({cmd: 'create_product'}, body);
    }

    @Public()
    @Get('getproducts')
    getProducts(){
        return this.productClient.send({cmd: 'get_all_products'}, {});
    }

    @Public()
    @Get('getproduct/:id')
    getProductById(@Param('id') id:string){
        return this.productClient.send({cmd: 'get_product_by_id'}, {id});
    }

    @Public()
    @Get('getproductsbyslug/:slug')
    getProductsBySlug(@Param('slug') slug:string){
        return this.productClient.send({cmd: 'get_products_by_slug'}, slug);
    }

    @Public()
    @Get('getavailableproducts')
    getAvailableProducts(){
        return this.productClient.send({cmd: 'get_available_products'}, {});
    }

    @Roles('ADMIN', 'INVENTORY_MANAGER')
    @Patch('updateproduct')
    updateProduct(@Body() body: { id: string } & UpdateProductDto){
        const { id, ...updateBody } = body;
        return this.productClient.send({cmd: 'update_product'}, { id, ...updateBody });
    }

    @Roles('ADMIN', 'INVENTORY_MANAGER')
    @Delete('deleteproduct/:id')
    deleteProduct(@Param('id') id: string){
        return this.productClient.send({cmd: 'delete_product'}, {id});
    }
    
    @Public()
    @Get('getproductsbycategory/:slug')
    getProductsByCategory(@Param('slug') slug: string){
        return this.productClient.send({cmd: 'get_products_by_category'}, {slug});
    }

    // category routes
    @Roles('ADMIN', 'INVENTORY_MANAGER')
    @Post('createcategory')
    createCategory(@Body() body: CreateCategoryDto){
        return this.productClient.send({cmd: 'create_category'}, body);
    }

    @Public()
    @Get('getcategories')
    getCategories(){
        return this.productClient.send({cmd: 'get_all_categories'}, {});
    }

    @Public()
    @Get('getcategory/:id')
    getCategoryById(@Param('id') id:string){
        return this.productClient.send({cmd: 'get_category_by_id'}, {id});
    }

    @Roles('ADMIN', 'INVENTORY_MANAGER')
    @Patch('updatecategory/:id')
    updateCategory(@Param('id') id: string, @Body() body: UpdateCategoryDto){
        return this.productClient.send({cmd: 'update_category'}, { id, ...body });
    }

    @Roles('ADMIN', 'INVENTORY_MANAGER')
    @Delete('deletecategory/:id')
    deleteCategory(@Param('id') id: string){
        return this.productClient.send({cmd: 'delete_category'}, {id});
    }

    @Public()
    @Get('getcategoriesbyslug/:slug')
    getCategoriesBySlug(@Param('slug') slug: string){
        return this.productClient.send({cmd: 'get_categories_by_slug'}, {slug});
    }
}


