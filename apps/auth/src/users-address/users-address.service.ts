import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserAddress } from './entities/user-address.entity';
import { CreateUserAddressDto, UpdateUserAddressDto } from '@apps/common';
import { RpcException } from '@nestjs/microservices';
import { User } from '../users/entities/user.entity';

@Injectable()
export class UsersAddressService {

    constructor(@InjectRepository(UserAddress) private readonly userAddressRepository: Repository<UserAddress>,
@InjectRepository(User) private readonly userRepo: Repository<User>) {}

async createUserAddress(userId: string, dto: CreateUserAddressDto) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new RpcException('User not found');

    // If new address is default, unset previous defaults
    if (dto.isDefault) {
      await this.userAddressRepository.update(
        { user: { id: userId } },
        { isDefault: false },
      );
    }

    const {password, ...userWithoutPassword} = user; 
    const address = this.userAddressRepository.create({
      ...dto,
      user: userWithoutPassword,
    });
    return this.userAddressRepository.save(address);
  }

  // ---------- GET ALL ----------
  async getUserAddresses(userId: string) {
    return this.userAddressRepository.find({
      where: { user: { id: userId } },
      order: { isDefault: 'DESC', createdAt: 'DESC' },
    });
  }

  // ---------- GET ONE ----------
  async getUserAddressById(addressId: string, userId?: string) {
    const address = await this.userAddressRepository.findOne({
      where: { id: addressId },
      relations: ['user'],
    });
    if (!address) throw new RpcException('Address not found');

    // Optional ownership check
    if (userId && address.user.id !== userId) {
      throw new RpcException('You do not own this address');
    }
    return address;
  }

  // ---------- UPDATE ----------
  async updateUserAddress(addressId: string, userId: string, dto: UpdateUserAddressDto) {
    const address = await this.getUserAddressById(addressId, userId);

    // If marking as default, unset others
    if (dto.isDefault) {
      await this.userAddressRepository.update(
        { user: { id: userId } },
        { isDefault: false },
      );
    }

    Object.assign(address, dto);
    return this.userAddressRepository.save(address);
  }

  // ---------- DELETE ----------
  async deleteUserAddress(addressId: string, userId: string) {
    const address = await this.getUserAddressById(addressId, userId);

    await this.userAddressRepository.remove(address);

    // Optional: if deleted address was default, set another as default
    if (address.isDefault) {
      const another = await this.userAddressRepository.findOne({
        where: { user: { id: userId } },
        order: { createdAt: 'ASC' },
      });
      if (another) {
        another.isDefault = true;
        await this.userAddressRepository.save(another);
      }
    }

    return { message: 'Address deleted successfully' };
  }

  // ---------- SET DEFAULT ----------
  async setDefault(addressId: string, userId: string) {
    const address = await this.getUserAddressById(addressId, userId);

    // unset all other defaults
    await this.userAddressRepository.update(
      { user: { id: userId } },
      { isDefault: false },
    );

    address.isDefault = true;
    return this.userAddressRepository.save(address);
  }

  // ---------- GET DEFAULT ----------
  async getDefault(userId: string) {
    return this.userAddressRepository.findOne({
      where: { user: { id: userId }, isDefault: true },
    });
  }
}

