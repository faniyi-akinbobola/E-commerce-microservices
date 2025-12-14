import { Controller, Post, UseGuards,Get, Patch,Delete,Param,Body, OnModuleInit , Logger, ServiceUnavailableException} from '@nestjs/common';
import { JwtBlacklistGuard } from '../guards/jwt-blacklist.guard';
import { ClientProxy } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { CreateCategoryDto, CreateProductDto, Public, RolesGuard, UpdateCategoryDto, UpdateProductDto, CircuitBreakerService } from '@apps/common';
import { Roles } from '@apps/common';
import { lastValueFrom, timeout } from 'rxjs';
import { error, time, timeEnd } from 'console';


@UseGuards(JwtBlacklistGuard, RolesGuard)
@Controller('product')
export class ProductController  implements OnModuleInit{

    private readonly Logger = new Logger(ProductController.name)

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

    constructor(@Inject('PRODUCT_SERVICE') private readonly productClient: ClientProxy,
    private readonly circuitBreakerService: CircuitBreakerService){}

    async onModuleInit() {
        this.initializeCircuitBreakers();
    }

    private initializeCircuitBreakers(){
        this.createProductCircuit = this.circuitBreakerService.createCircuitBreaker(
            async( data: CreateProductDto)=> {
                return await lastValueFrom(
                    this.productClient.send({cmd :'create_product'}, data).pipe(timeout(10000))
                )
            },
            {
                timeout: 10000,
                errorThresholdPercentage: 50,
                resetTimeout: 30000,
                name: 'create_product',
            }
        );

        this.createProductCircuit.fallback(()=>{
            throw new ServiceUnavailableException("Create product service is currently unavailable. Please try again later.");
        });

        this.getProductsCircuit = this.circuitBreakerService.createCircuitBreaker(
            async( )=>{
                return await lastValueFrom(
                    this.productClient.send({cmd: 'get_all_products'}, {}).pipe(timeout(5000))
                )
            },
            {
                timeout: 5000,
                errorThresholdPercentage: 50,
                resetTimeout: 30000,
                name: 'get_all_products'
            }
        );

        this.getProductsCircuit.fallback(()=>{
            throw new ServiceUnavailableException("Get products service is currently unavailable. Please try again later.");
        });

        this.getProductsByIdCircuit = this.circuitBreakerService.createCircuitBreaker(
            async (id: string)=>{
                return await lastValueFrom(
                    this.productClient.send({cmd: 'get_product_by_id'}, {id}).pipe(timeout(5000)));
            },
            {
                timeout: 5000,
                errorThresholdPercentage: 50,
                resetTimeout: 30000,
                name: 'get_product_by_id'
            }
        );

        this.getProductsByIdCircuit.fallback(()=>{
            throw new ServiceUnavailableException('Get products by id service is currently unavailable. Please try again later.')
        });

        this.getProductsBySlugCircuit = this.circuitBreakerService.createCircuitBreaker(
            async (slug: string)=> {
                return await lastValueFrom(
                    this.productClient.send({cmd: 'get_products_by_slug'}, {slug}).pipe(timeout(5000))
                )
            },
            {
                timeout: 5000,
                errorThresholdPercentage: 50,
                resetTimeout: 30000,
                name: "get_products_by_slug"
            }
        );

        this.getProductsBySlugCircuit.fallback(() =>{
            throw new ServiceUnavailableException("Get products by slug service is currently unavailable. Please try again later.");
        });

        this.getAvailableProductsCircuit = this.circuitBreakerService.createCircuitBreaker(
            async()=>{
                return await lastValueFrom(
                    this.productClient.send({cmd: 'get_available_products'}, {}).pipe(timeout(5000))
                )
            },
            {
                timeout: 5000,
                errorThresholdPercentage: 50,
                resetTimeout: 30000,
                name: "get_available_products"
            }
        );

        this.getAvailableProductsCircuit.fallback(()=>{
            throw new ServiceUnavailableException('Get available products service is currently unavailable. Please try again later.')
        });

        this.updateProductCircuit = this.circuitBreakerService.createCircuitBreaker(
            async(data:{id: string} & UpdateProductDto)=>{
                return await lastValueFrom(
                    this.productClient.send({cmd:'update_product'}, data).pipe(timeout(5000))
                )
            },
            {
                timeout: 10000,
                errorThresholdPercentage: 50,
                resetTimeout: 30000,
                name: "update_product"
            }
        );

        this.updateProductCircuit.fallback(()=>{
            throw new ServiceUnavailableException("Update products service is currently unavailable. Please try again later.");
        })

        this.deleteProductCircuit = this.circuitBreakerService.createCircuitBreaker(
            async (id: string) => {
                return await lastValueFrom(
                    this.productClient.send({cmd:'delete_product'}, {id}).pipe(timeout(5000))
                )
            },
            {
                timeout: 5000,
                errorThresholdPercentage: 50,
                resetTimeout: 30000,
                name: "delete_product"
            }
        );

        this.deleteProductCircuit.fallback(()=>{
            throw new ServiceUnavailableException("Delete products service is currently unavailable. Please try again later.");
        });

        this.getProductsByCategoryCircuit = this.circuitBreakerService.createCircuitBreaker(
            async()=> {
                return await lastValueFrom(
                    this.productClient.send({cmd: "get_products_by_category"}, {}).pipe(timeout(5000))
                )
            },
            {
                timeout: 5000,
                errorThresholdPercentage: 50,
                resetTimeout: 30000,
                name: "get_products_by_category"
            }
        );

        this.getProductsByCategoryCircuit.fallback(()=>{
            throw new ServiceUnavailableException("Get products by category service is currently unavailable. Please try again later.")
        });

        this.createCategoryCircuit = this.circuitBreakerService.createCircuitBreaker(
            async()=>{
                return await lastValueFrom(
                    this.productClient.send({cmd: "create_category"}, {}).pipe(timeout(5000))
                )
            },
            {
                timeout: 10000,
                errorThresholdPercentage: 50,
                resetTimeout: 30000,
                name: "create_category"
            }
        );

        this.createCategoryCircuit.fallback(()=>{
            throw new ServiceUnavailableException("Create category service is currently unavailable. Please try again later.")
        });

        this.getCategoriesCircuit = this.circuitBreakerService.createCircuitBreaker(
            async()=>{
                return await lastValueFrom(
                    this.productClient.send({cmd: "get_all_categories"}, {}).pipe(timeout(5000))
                )
            },
            {
                timeout: 5000,
                errorThresholdPercentage: 50,
                resetTimeout: 30000,
                name: "get_all_categories"
            }
        );

        this.getCategoriesCircuit.fallback(()=>{
            throw new ServiceUnavailableException("Get category service is currently unavailable. Please try again later.")
        });

        this.getCategoriesByIdCircuit = this.circuitBreakerService.createCircuitBreaker(
            async(id: string) => {
                return await this.productClient.send({cmd:"get_category_by_id"}, {id}).pipe(timeout(5000))
            },
            {
                timeout: 5000,
                errorThresholdPercentage: 50,
                resetTimeout: 30000,
                name: "get_category_by_id"
            }
        );

        this.getCategoriesByIdCircuit.fallback(() => {
            throw new ServiceUnavailableException("Get categories by id service is currently unavailable. Please try again later.")
        });

        this.updateCategoryCircuit = this.circuitBreakerService.createCircuitBreaker(
            async(data: {id: string} & UpdateCategoryDto)=>{
                return await lastValueFrom(
                    this.productClient.send({cmd: "update_category"}, data).pipe(timeout(5000))
                )
            },
            {
                timeout: 10000,
                errorThresholdPercentage: 50,
                resetTimeout: 30000,
                name: "update_category"
            }
        );

        this.updateCategoryCircuit.fallback(()=>{
            throw new ServiceUnavailableException("Update category service is currently unavailable. Please try again later.");
        });

        this.deleteCategoryCircuit = this.circuitBreakerService.createCircuitBreaker(
            async(id : string)=>{
                return await lastValueFrom(
                    this.productClient.send({cmd: "delete_category"}, {id}).pipe(timeout(5000))
                )
            },
            {
                timeout: 5000,
                errorThresholdPercentage: 50,
                resetTimeout: 30000,
                name: "delete_category"
            }
        );

        this.deleteCategoryCircuit.fallback(()=>{
            throw new ServiceUnavailableException("Delete category service is currently unavailable. Please try again later.")
        });

        this.getCategoriesBySlugCircuit = this.circuitBreakerService.createCircuitBreaker(
            async(slug: string) => {
                return await lastValueFrom(
                    this.productClient.send({cmd: "get_categories_by_slug"}, {slug}).pipe(timeout(5000))
                )
            },
            {
                timeout: 5000,
                errorThresholdPercentage: 50,
                resetTimeout: 30000,
                name: "get_categories_by_slug"
            }
        );

        this.getCategoriesBySlugCircuit.fallback(()=>{
            throw new ServiceUnavailableException("Get categories by slug service is currently unavailable. Please try again later.")
        })


    }
    
    // product routes
    @Roles('ADMIN', 'INVENTORY_MANAGER')
    @Post('createproduct')
    async createProduct(@Body() body: CreateProductDto){
        try {
            return await this.createProductCircuit.fire(body)
        } catch (error) {
            this.Logger.error(`create product failed: ${error}`);
            throw error;
        }
    }

    @Public()
    @Get('getproducts')
    async getProducts(){
        try {
            return await this.getProductsCircuit.fire()
        } catch (error) {
            this.Logger.error(`get products failed: ${error}`);
            throw error;
        }
    }

    @Public()
    @Get('getproduct/:id')
    async getProductById(@Param('id') id:string){
        try {
            return await this.getProductsByIdCircuit.fire(id)
        } catch (error) {
            this.Logger.error(`get product by id failed: ${error}`);
            throw error;
        }
    }

    @Public()
    @Get('getproductsbyslug/:slug')
    async getProductsBySlug(@Param('slug') slug:string){
        try {
            return await this.getProductsBySlugCircuit.fire(slug)
        } catch (error) {
            this.Logger.error(`get products by slug failed: ${error}`)
            throw error;
        }
    }

    @Public()
    @Get('getavailableproducts')
    async getAvailableProducts(){
        try {
            return await this.getAvailableProductsCircuit.fire()
        } catch (error) {
            this.Logger.error(`get available products failed: ${error}`)
        }
    }

    @Roles('ADMIN', 'INVENTORY_MANAGER')
    @Patch('updateproduct')
    async updateProduct(@Body() body: { id: string } & UpdateProductDto){
        try {
            return await this.updateProductCircuit.fire(body)
        } catch (error) {
            this.Logger.error(`update product failed: ${error}`);
            throw error;
        }
    }

    @Roles('ADMIN', 'INVENTORY_MANAGER')
    @Delete('deleteproduct/:id')
    async deleteProduct(@Param('id') id: string){
       try {
       return await this.deleteProductCircuit.fire(id)
       } catch (error) {
        this.Logger.error(`delete product failed: ${error}`);
        throw error;
       }
    }
    
    @Public()
    @Get('getproductsbycategory/:slug')
    async getProductsByCategory(@Param('slug') slug: string){
        try {
            return await this.getProductsByCategoryCircuit.fire(slug)
        } catch (error) {
            this.Logger.error(`get products category by slug failed: ${error}`)
        }
    }

    // category routes
    @Roles('ADMIN', 'INVENTORY_MANAGER')
    @Post('createcategory')
    async createCategory(@Body() body: CreateCategoryDto){
        try {
            return await this.createCategoryCircuit.fire(body)
        } catch (error) {
            this.Logger.error(`create category failed: ${error}`);
            throw error;
        }
    }

    @Public()
    @Get('getcategories')
    async getCategories(){
        try {
           return await this.getCategoriesCircuit.fire()
        } catch (error) {
            this.Logger.error(`get categories failed: ${error}`);
            throw error;
        }
    }

    @Public()
    @Get('getcategory/:id')
    async getCategoryById(@Param('id') id:string){
        try {
            return await this.getCategoriesByIdCircuit.fire(id)
        } catch (error) {
            this.Logger.error(`get category by id failed: ${error}`);
            throw error;
        }
    }

    @Roles('ADMIN', 'INVENTORY_MANAGER')
    @Patch('updatecategory/:id')
    async updateCategory(@Param('id') id: string, @Body() body: UpdateCategoryDto){
        try {
           return await this.updateCategoryCircuit.fire({id, ...body})
        } catch (error) {
            this.Logger.error(`update category failed: ${error}`);
            throw error;
        }
    }

    @Roles('ADMIN', 'INVENTORY_MANAGER')
    @Delete('deletecategory/:id')
    async deleteCategory(@Param('id') id: string){
        try {
            return await this.deleteCategoryCircuit.fire(id)
        } catch (error) {
            this.Logger.error(`delete category failed: ${error}`);
            throw error;
        }
    }

    @Public()
    @Get('getcategoriesbyslug/:slug')
    async getCategoriesBySlug(@Param('slug') slug: string){
        try {
            return await this.getCategoriesBySlugCircuit.fire(slug);
        } catch (error) {
            this.Logger.error(`get categories by slug: ${error}`);
            throw error;
        }
    }
}


