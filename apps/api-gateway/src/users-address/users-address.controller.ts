import { Controller, Delete, Get, Patch, Post,Body, Param, Req, UseGuards, ServiceUnavailableException, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { UpdateUserAddressDto, CreateUserAddressDto, Roles } from '@apps/common';
import { JwtBlacklistGuard } from '../guards/jwt-blacklist.guard';
import { OnModuleInit } from '@nestjs/common';
import { CircuitBreakerService } from '@apps/common';
import { lastValueFrom, timeout } from 'rxjs';


@UseGuards(JwtBlacklistGuard)
@Controller('users-address')
export class UsersAddressController implements OnModuleInit {
    
    private readonly logger = new Logger(UsersAddressController.name)

    private createUserAddressCircuit;
    private getUserAddressesCircuit;
    private updateUserAddressCircuit;
    private deleteUserAddressCircuit;
    private getUserAddressByIdCircuit;


    constructor(@Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
    private readonly circuitBreakerService: CircuitBreakerService
) {}

    async onModuleInit() {
        this.initializeCircuitBreakers();
    }

    private initializeCircuitBreakers(){
        this.createUserAddressCircuit = this.circuitBreakerService.createCircuitBreaker(
            async(data: CreateUserAddressDto)=>{
                return await lastValueFrom(this.authClient.send({cmd:"create_user_address"}, data).pipe(timeout(10000)))
            },
            {
                timeout: 10000,
                errorThresholdPercentage: 50,
                resetTimeout: 3000,
                name: "create_user_address"
            }
        );

        this.createUserAddressCircuit.fallback(()=>{
            throw new ServiceUnavailableException(`Create user address failed. Please try again later.`)
        });

        this.getUserAddressesCircuit = this.circuitBreakerService.createCircuitBreaker(
            async()=>{
                return await lastValueFrom(this.authClient.send({cmd: "get_user_addresses"}, {}).pipe(timeout(5000)))
            },
            {
                timeout: 5000,
                errorThresholdPercentage: 50,
                resetTimeout: 3000,
                name: "get_user_addresses"
            }
        );

        this.getUserAddressesCircuit.fallback(()=>{
            throw new ServiceUnavailableException(`Get user addresses failed. Please try again later.`)
        });

        this.updateUserAddressCircuit = this.circuitBreakerService.createCircuitBreaker(
            async(data:{id: string} & UpdateUserAddressDto)=>{
                return await lastValueFrom(this.authClient.send({cmd:"update_user_address"}, data).pipe(timeout(10000)))
            },
            {
                timeout: 10000,
                errorThresholdPercentage: 50,
                resetTimeout: 3000,
                name: "update_user_address"
            }
        );

        this.updateUserAddressCircuit.fallback(()=>{
            throw new ServiceUnavailableException(`Update user address failed. Please try again later.`)
        });

        this.deleteUserAddressCircuit = this.circuitBreakerService.createCircuitBreaker(
            async (id: string)=>{
                return await lastValueFrom(this.authClient.send({cmd:"delete_user_address"}, {id}).pipe(timeout(5000)))
            },
            {
                timeout: 5000,
                errorThresholdPercentage: 50,
                resetTimeout: 3000,
                name: "delete_user_address"
            }
        );

        this.deleteUserAddressCircuit.fallback(()=>{
            throw new ServiceUnavailableException(`Delete user address service failed. Please try again later.`)
        });

        this.getUserAddressByIdCircuit = this.circuitBreakerService.createCircuitBreaker(
            async(id: string)=>{
               return await lastValueFrom(this.authClient.send({cmd: "get_user_address_by_id"}, {id}).pipe(timeout(5000)))
            },
            {
                timeout: 5000,
                errorThresholdPercentage: 50,
                resetTimeout: 3000,
                name:"get_user_address_by_id"
            }
        );

        this.getUserAddressByIdCircuit.fallback(()=>{
            throw new ServiceUnavailableException(`Get user address by id failed. Please try again later.`)
        })
    
    }

   @Roles('ADMIN', 'CUSTOMER')
    @Post('createuseraddress')
    async createUserAddress(@Body() createUserAddressDto: CreateUserAddressDto, @Req() req) {
        // return this.authClient.send({ cmd: 'create_user_address' }, {...createUserAddressDto, userId: req.user.id });
        try {
            return await this.createUserAddressCircuit.fire({
                userId: req.user.id,
                ...createUserAddressDto
            })
        } catch (error) {
            this.logger.error(`create user failed: ${error}`)
            throw error;
        }
    }

    @Roles('ADMIN', 'CUSTOMER')
    @Get('getuseraddresses')
    async getUserAddresses(@Req() req) {
        // return this.authClient.send({ cmd: 'get_user_addresses' }, { userId: req.user.id });
        try {
            return await this.getUserAddressesCircuit.fire({
                userId: req.user.id,
            })
        } catch (error) {
            this.logger.error(`get user addresses failed: ${error}`);
            throw error;
        }
    }

    @Roles('ADMIN', 'CUSTOMER')
    @Patch('updateuseraddress/:id')
    async updateUserAddress(
    @Param('id') id: string,
    @Body() updateUserAddressDto: UpdateUserAddressDto,
    @Req() req
    ) {
    // return this.authClient.send(
    //     { cmd: 'update_user_address' },
    //     { id, updateUserAddressDto, userId: req.user.id }
    // );
    try {
       return await this.updateUserAddressCircuit.fire({
            userId: req.user.id,
            id,
            ...updateUserAddressDto
        })
    } catch (error) {
        this.logger.error(`Update user address failed: ${error}`);
        throw error;
    }
    }

    @Roles('ADMIN', 'CUSTOMER')
    @Delete('deleteuseraddress/:id')
    async deleteUserAddress(@Param('id') id: string, @Req() req) {
    // return this.authClient.send(
    //     { cmd: 'delete_user_address' },
    //     { id, userId: req.user.id }
    // );
    try {
       return await  this.deleteUserAddressCircuit.fire({
            userId: req.user.id,
            id
        })
    } catch (error) {
        this.logger.error(`delete user address failed: ${error}`);
        throw error;
    }
    }

    @Roles('ADMIN', 'CUSTOMER')
    @Get('getuseraddressbyid/:id')
    async getUserAddressById(@Param('id') id: string, @Req() req) {
        // return this.authClient.send({ cmd: 'get_user_address_by_id' }, { id, userId: req.user.id });
        try {
            return await this.getUserAddressByIdCircuit.fire({
                userId: req.user.id,
                id
            })
        } catch (error) {
            this.logger.error(`Get user address by id failed: ${error }`);
            throw error;
        }
    }
    
}
