import { Inject, Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from 'common/dtos/create-user.dto';
import { UpdateUserDto } from 'common/dtos/update-user.dto';


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
            throw new ConflictException('User already exists');
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

    async deleteUser(id: string): Promise<User> {
        const user = await this.userRepository.findOne({where: {id}});
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return this.userRepository.remove(user);
    }

    async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<User> {
        const user = await this.userRepository.preload({
            id: id,
            ...updateUserDto
        });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return this.userRepository.save(user);
    }

    async getUsers(): Promise<User[]> {
        const users = await this.userRepository.find();
        if (!users) {
            throw new NotFoundException('No users found');
        }
        return users;
    }
}
