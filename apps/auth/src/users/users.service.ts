import { Inject, Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from 'common/dtos/create-user.dto';
import { UpdateUserDto } from 'common/dtos/update-user.dto';
import { RpcException } from '@nestjs/microservices';
import { RpcExceptionFilterMicroservice } from '@apps/common';


@Injectable()
export class UsersService {

    constructor(@InjectRepository(User) private readonly userRepository: Repository<User>){}

    async createUser(createUserDto: CreateUserDto): Promise<User> {
        // Check if user already exists (by email or username)
        const existingUser = await this.userRepository.findOne({
            where: [
                { email: createUserDto.email },
                { username: createUserDto.username }
            ]
        });
        if (existingUser) {
            throw new RpcException('User already exists');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

        // Create user entity
        const user = this.userRepository.create({
            ...createUserDto,
            password: hashedPassword,
        });
        return this.userRepository.save(user);
    }

    async deleteUser(targetUserId: string, requesterId: string): Promise<User> {
        if (targetUserId !== requesterId) {
            throw new RpcException('Forbidden: You can only delete your own account');
        }
        const user = await this.userRepository.findOne({ where: { id: targetUserId } });
        if (!user) {
            throw new RpcException('User not found');
        }
        return this.userRepository.remove(user);
    }

    async updateUser(targetUserId: string, requesterId: string, updateUserDto: UpdateUserDto): Promise<User> {
        if (targetUserId !== requesterId) {
            throw new RpcException('Forbidden: You can only update your own account');
        }
        const user = await this.userRepository.preload({
            id: targetUserId,
            ...updateUserDto
        });
        if (!user) {
            throw new RpcException('User not found');
        }
        return this.userRepository.save(user);
    }

    async getUsers(): Promise<User[]> {
        const users = await this.userRepository.find();
        if (!users) {
            throw new RpcException('No users found');
        }
        return users;
    }

    async getUserById(id: string) : Promise<User>{
        const user = await this.userRepository.findOne({where: {id}});
        if (!user) {
            throw new RpcException('User Not Found');
        }
        return user;
    }
}
