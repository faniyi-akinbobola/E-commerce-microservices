import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from 'common/dtos/create-user.dto';
import { UpdateUserDto } from 'common/dtos/update-user.dto';


@Injectable()
export class UsersService {

    constructor(@InjectRepository(User) private readonly userRepository: Repository<User>){}

    async findById(userId: string) {
      throw new Error('Method not implemented.');
    }

    async findByEmail(email: string) {
      throw new Error('Method not implemented.');
    }

    async updatePassword(userId: string, newHash: string) {
      throw new Error('Method not implemented.');
    }

    async createUser(createUserDto: CreateUserDto): Promise<User> {
        const user = this.userRepository.create(createUserDto);
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
