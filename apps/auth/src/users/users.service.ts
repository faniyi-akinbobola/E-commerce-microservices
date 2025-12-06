import { Inject, Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from 'common/dtos/create-user.dto';
import { UpdateUserDto } from 'common/dtos/update-user.dto';
import { RpcException } from '@nestjs/microservices';
import { RpcExceptionFilterMicroservice } from '@apps/common';
import { randomBytes } from 'crypto';
import { Blacklist } from '../blacklist/blacklist.entity';


@Injectable()
export class UsersService {

    constructor(
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        @InjectRepository(Blacklist) private readonly blacklistRepository: Repository<Blacklist>,
    ){}

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


        // Generate refresh token
        const refreshToken = generateRefreshToken();

        // Create user entity
        const user = this.userRepository.create({
            ...createUserDto,
            password: hashedPassword,
            refreshToken,
        });
        return this.userRepository.save(user);
    }

    async deleteUser(targetUserId: string, requesterId: string, token?: string): Promise<User> {
        if (targetUserId !== requesterId) {
            throw new RpcException('Forbidden: You can only delete your own account');
        }
        const user = await this.userRepository.findOne({ where: { id: targetUserId } });
        if (!user) {
            throw new RpcException('User not found');
        }

        // Blacklist the current token to immediately invalidate it
        if (token) {
            await this.blacklistRepository.save({ token });
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

    async getUsers(): Promise<Omit<User, 'password'>[]> {
        const users = await this.userRepository.find();
        if (!users) {
            throw new RpcException('No users found');
        }
        // Exclude password from each user
        return users.map(({ password, ...user }) => user);
    }

    async getUserById(id: string) : Promise<Omit<User, 'password'>>{
        const user = await this.userRepository.findOne({where: {id}});
        if (!user) {
            throw new RpcException('User Not Found');
        }
        // Exclude password
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
}
function generateRefreshToken(): string {
  return randomBytes(32).toString('hex');


}

