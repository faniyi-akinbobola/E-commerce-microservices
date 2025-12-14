import { Controller, Get, Post, Delete, Patch, Inject, Param, Body, UseGuards, Req, OnModuleInit, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { UpdateUserDto } from 'common/dtos/update-user.dto';
import { JwtBlacklistGuard } from '../guards/jwt-blacklist.guard';
import { Roles } from '@apps/common';
import { lastValueFrom } from 'rxjs';
import { CircuitBreakerService } from '@apps/common';
import { timeout } from 'rxjs/operators';

@UseGuards(JwtBlacklistGuard)
@Controller('users')
export class UsersController implements OnModuleInit{

    private readonly logger = new Logger(UsersController.name);

    private getUsersCircuit;
    private getUserByIdCircuit;
    private deleteUserCircuit;
    private updateUserCircuit;
    private deleteUserByAdminCircuit;

    constructor(@Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
private readonly circuitBreakerService: CircuitBreakerService) {}

async onModuleInit(){
    this.initializeCircuitBreakers();
}

private initializeCircuitBreakers(){

    this.getUsersCircuit = this.circuitBreakerService.createCircuitBreaker(
        async()=>{
            return await lastValueFrom(this.authClient.send({cmd: 'get_users' }, {}).pipe(timeout(5000)))
        },
        {
            timeout: 5000,
            errorThresholdPercentage: 50,
            resetTimeout: 3000,
            name: "get_users"
        }
    );

    this.getUsersCircuit.fallback(()=>{
        throw new Error('Get users service is temporarily unavailable. Please try again later.')
    });

    this.getUserByIdCircuit = this.circuitBreakerService.createCircuitBreaker(
        async(id: string)=>{
            return await lastValueFrom(this.authClient.send({cmd:'get_user_by_id'}, {id}).pipe(timeout(5000)    ))
        },
        {
            timeout: 5000,
            errorThresholdPercentage: 50,
            resetTimeout: 3000,
            name: "get_user_by_id"
        }
    );

    this.getUserByIdCircuit.fallback(()=>{
        throw new Error('Get user by ID service is temporarily unavailable. Please try again later.')
    });

    this.deleteUserCircuit = this.circuitBreakerService.createCircuitBreaker(
        async(data: {id: string, requesterId: string, token?: string})=>{
            return await lastValueFrom(this.authClient.send({ cmd: 'delete_user' }, data).pipe(timeout(5000)))
        },
        {
            timeout: 5000,
            errorThresholdPercentage: 50,
            resetTimeout: 3000,
            name: "delete_user"
        }
    );

    this.deleteUserCircuit.fallback(()=>{
        throw new Error('Delete user service is temporarily unavailable. Please try again later.')
    });

    this.updateUserCircuit = this.circuitBreakerService.createCircuitBreaker(
        async(data: { id: string, requesterId: string, updateUserDto: UpdateUserDto })=>{
            return await lastValueFrom(this.authClient.send({ cmd: 'update_user' }, data).pipe(timeout(5000)))
        },
        {
            timeout: 5000,
            errorThresholdPercentage: 50,
            resetTimeout: 3000,
            name: "update_user"
        }
    );

    this.updateUserCircuit.fallback(()=>{
        throw new Error('Update user service is temporarily unavailable. Please try again later.')
    });

    this.deleteUserByAdminCircuit = this.circuitBreakerService.createCircuitBreaker(
        async(data: {id: string, requesterId: string, token?: string})=>{
            return await lastValueFrom(this.authClient.send({ cmd: 'delete_user' }, data).pipe(timeout(10000)))
        },
        {
            timeout: 10000,
            errorThresholdPercentage: 50,
            resetTimeout: 3000,
            name: "delete_user_by_admin"
        }
    );

    this.deleteUserByAdminCircuit.fallback(()=>{
        throw new Error('Delete user by admin service is temporarily unavailable. Please try again later.')
    });
}

    @Roles('ADMIN')
    @Get('getusers')
    async getUsers(){
        // return this.authClient.send({cmd: 'get_users' }, {})
        try {
            return await this.getUsersCircuit.fire();
        } catch (error) {
            this.logger.error(`Get users failed: ${error.message}`);
            throw error;
        }
    }

    @Roles('ADMIN', 'CUSTOMER')
    @Get('getuser/:id')
    async getUserById(@Param('id') id:string){
        // return this.authClient.send({cmd:'get_user_by_id'}, {id})
        try {
            return await this.getUserByIdCircuit.fire(id);
        } catch (error) {
            this.logger.error(`Get user by ID failed: ${error.message}`);
            throw error;
        }
    }

    @Roles('ADMIN', 'CUSTOMER')
    @Delete('deleteuser')
    async deleteUser(@Req() req) {
        // const jwtToken = req.headers['authorization']?.replace('Bearer ', '');
        // return this.authClient.send({ cmd: 'delete_user' }, { id: req.user.id, requesterId: req.user.id, token: jwtToken });
        try {
            const jwtToken = req.headers['authorization']?.replace('Bearer ', '');
            return await this.deleteUserCircuit.fire({ id: req.user.id, requesterId: req.user.id, token: jwtToken });
        } catch (error) {
            this.logger.error(`Delete user failed: ${error}`);
            throw error;
        }
    }

    @Roles('ADMIN', 'CUSTOMER')
    @Patch('updateuser')
    async updateUser(@Body() updateUserDto: UpdateUserDto, @Req() req) {
        // return this.authClient.send({ cmd: 'update_user' }, { id: req.user.id, requesterId: req.user.id, updateUserDto });
        try {
            return await this.updateUserCircuit.fire({ id: req.user.id, requesterId: req.user.id, updateUserDto });
        } catch (error) {
            this.logger.error(`Update user failed: ${error}`);
            throw error;
        }
    }

    // DELETE ACCOUNT FOR ADMIN TO DELETE ANY USER
    @Roles('ADMIN')
    @Delete('deleteuser/:id')
    async deleteUserByAdmin(@Param('id') id: string, @Req() req) {
        // const jwtToken = req.headers['authorization']?.replace('Bearer ', '');
        // return this.authClient.send({ cmd: 'delete_user' }, { id, requesterId: req.user.id, token: jwtToken });
        try {
            const jwtToken = req.headers['authorization']?.replace('Bearer ', '');
            return await this.deleteUserByAdminCircuit.fire({ id, requesterId: req.user.id, token: jwtToken });
        } catch (error) {
            this.logger.error(`Delete user by admin failed: ${error}`);
            throw error;
        }
    }

}