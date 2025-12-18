import { Test, TestingModule } from '@nestjs/testing';
import { UsersAddressService } from './users-address.service';
import { Repository } from 'typeorm';
import { UserAddress } from './entities/user-address.entity';
import { User } from '../users/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RpcException } from '@nestjs/microservices';

describe('UsersAddressService', () => {
  let service: UsersAddressService;
  let userAddressRepository: jest.Mocked<Repository<UserAddress>>;
  let userRepository: jest.Mocked<Repository<User>>;

  const mockUser = {
    id: '1',
    username: 'alex',
    email: 'alex@example.com',
    password: 'hashedpassword',
    resetToken: null,
    refreshToken: null,
    resetTokenExpires: null,
    role: 'CUSTOMER' as any,
    addresses: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUserRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
  };

  const mockUserAddressRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersAddressService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(UserAddress),
          useValue: mockUserAddressRepository,
        },
      ],
    }).compile();

    service = module.get<UsersAddressService>(UsersAddressService);
    userRepository = module.get(getRepositoryToken(User));
    userAddressRepository = module.get(getRepositoryToken(UserAddress));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createUserAddress', () => {
    it('should create a new address for a user', async () => {
      const dto = {
        fullName: 'Alex Rivera',
        phone: '+1-555-012-3456',
        street: '123 Backend Blvd',
        city: 'San Francisco',
        state: 'California',
        country: 'United States',
        postalCode: '94105',
        isDefault: true,
      } as any;

      userRepository.findOne.mockResolvedValue(mockUser as User);
      userAddressRepository.update.mockResolvedValue({ affected: 1 } as any);
      userAddressRepository.create.mockReturnValue({ id: '1', ...dto } as any);
      userAddressRepository.save.mockResolvedValue({ id: '1', ...dto } as any);

      const result = await service.createUserAddress('1', dto);

      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(userAddressRepository.update).toHaveBeenCalled();
      expect(userAddressRepository.create).toHaveBeenCalled();
      expect(userAddressRepository.save).toHaveBeenCalled();
      expect(result).toHaveProperty('id');
    });

    it('should throw an error if user not found', async () => {
      const dto = {
        fullName: 'Alex Rivera',
        phone: '+1-555-012-3456',
        street: '123 Backend Blvd',
        city: 'San Francisco',
        state: 'California',
        country: 'United States',
        postalCode: '94105',
        isDefault: false,
      } as any;

      userRepository.findOne.mockResolvedValue(null);

      await expect(service.createUserAddress('1', dto)).rejects.toThrow(RpcException);
      await expect(service.createUserAddress('1', dto)).rejects.toThrow('User not found');
    });

    it('should unset previous default addresses when creating a new default address', async () => {
      const dto = {
        fullName: 'Alex Rivera',
        phone: '+1-555-012-3456',
        street: '123 Backend Blvd',
        city: 'San Francisco',
        state: 'California',
        country: 'United States',
        postalCode: '94105',
        isDefault: true,
      } as any;

      userRepository.findOne.mockResolvedValue(mockUser as User);
      userAddressRepository.update.mockResolvedValue({ affected: 1 } as any);
      userAddressRepository.create.mockReturnValue({ id: '1', ...dto } as any);
      userAddressRepository.save.mockResolvedValue({ id: '1', ...dto } as any);

      await service.createUserAddress('1', dto);

      expect(userAddressRepository.update).toHaveBeenCalledWith(
        { user: { id: '1' } },
        { isDefault: false },
      );
    });

    it('should not unset previous default addresses when creating a non-default address', async () => {
      const dto = {
        fullName: 'Alex Rivera',
        phone: '+1-555-012-3456',
        street: '123 Backend Blvd',
        city: 'San Francisco',
        state: 'California',
        country: 'United States',
        postalCode: '94105',
        isDefault: false,
      } as any;

      userRepository.findOne.mockResolvedValue(mockUser as User);
      userAddressRepository.create.mockReturnValue({ id: '1', ...dto } as any);
      userAddressRepository.save.mockResolvedValue({ id: '1', ...dto } as any);

      await service.createUserAddress('1', dto);

      expect(userAddressRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('getUserAddresses', () => {
    it('should retrieve all addresses for a user', async () => {
      const addresses = [
        { id: '1', fullName: 'Address 1', isDefault: true },
        { id: '2', fullName: 'Address 2', isDefault: false },
      ];

      userAddressRepository.find.mockResolvedValue(addresses as any);

      const result = await service.getUserAddresses('1');

      expect(userAddressRepository.find).toHaveBeenCalledWith({
        where: { user: { id: '1' } },
        order: { isDefault: 'DESC', createdAt: 'DESC' },
      });
      expect(result).toEqual(addresses);
    });

    it('should return empty array if user has no addresses', async () => {
      userAddressRepository.find.mockResolvedValue([]);

      const result = await service.getUserAddresses('1');

      expect(result).toEqual([]);
    });
  });

  describe('getUserAddressById', () => {
    it('should retrieve a single address by ID', async () => {
      const address = {
        id: '1',
        fullName: 'Address 1',
        user: { id: '1' },
      };

      userAddressRepository.findOne.mockResolvedValue(address as any);

      const result = await service.getUserAddressById('1');

      expect(userAddressRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: ['user'],
      });
      expect(result).toEqual(address);
    });

    it('should throw an error if address not found', async () => {
      userAddressRepository.findOne.mockResolvedValue(null);

      await expect(service.getUserAddressById('1')).rejects.toThrow(RpcException);
      await expect(service.getUserAddressById('1')).rejects.toThrow('Address not found');
    });

    it('should throw an error if user does not own the address', async () => {
      const address = {
        id: '1',
        fullName: 'Address 1',
        user: { id: '2' },
      };

      userAddressRepository.findOne.mockResolvedValue(address as any);

      await expect(service.getUserAddressById('1', '1')).rejects.toThrow(RpcException);
      await expect(service.getUserAddressById('1', '1')).rejects.toThrow(
        'You do not own this address',
      );
    });

    it('should allow retrieval without ownership check', async () => {
      const address = {
        id: '1',
        fullName: 'Address 1',
        user: { id: '2' },
      };

      userAddressRepository.findOne.mockResolvedValue(address as any);

      const result = await service.getUserAddressById('1');

      expect(result).toEqual(address);
    });
  });

  describe('updateUserAddress', () => {
    it('should update an address successfully', async () => {
      const address = {
        id: '1',
        fullName: 'Old Name',
        user: { id: '1' },
      };

      const dto = {
        fullName: 'New Name',
        isDefault: false,
      } as any;

      userAddressRepository.findOne.mockResolvedValue(address as any);
      userAddressRepository.save.mockResolvedValue({
        ...address,
        ...dto,
      } as any);

      const result = await service.updateUserAddress('1', '1', dto);

      expect(userAddressRepository.save).toHaveBeenCalled();
      expect(result.fullName).toBe('New Name');
    });

    it('should unset previous default addresses when updating to default', async () => {
      const address = {
        id: '1',
        fullName: 'Address 1',
        user: { id: '1' },
        isDefault: false,
      };

      const dto = {
        isDefault: true,
      } as any;

      userAddressRepository.findOne.mockResolvedValue(address as any);
      userAddressRepository.update.mockResolvedValue({ affected: 1 } as any);
      userAddressRepository.save.mockResolvedValue({
        ...address,
        ...dto,
      } as any);

      await service.updateUserAddress('1', '1', dto);

      expect(userAddressRepository.update).toHaveBeenCalledWith(
        { user: { id: '1' } },
        { isDefault: false },
      );
    });

    it('should throw an error if address not found', async () => {
      const dto = { fullName: 'New Name' } as any;

      userAddressRepository.findOne.mockResolvedValue(null);

      await expect(service.updateUserAddress('1', '1', dto)).rejects.toThrow(RpcException);
    });

    it('should throw an error if user does not own the address', async () => {
      const address = {
        id: '1',
        fullName: 'Address 1',
        user: { id: '2' },
      };

      const dto = { fullName: 'New Name' } as any;

      userAddressRepository.findOne.mockResolvedValue(address as any);

      await expect(service.updateUserAddress('1', '1', dto)).rejects.toThrow(RpcException);
    });
  });

  describe('deleteUserAddress', () => {
    it('should delete an address successfully', async () => {
      const address = {
        id: '1',
        fullName: 'Address 1',
        user: { id: '1' },
        isDefault: false,
      };

      userAddressRepository.findOne.mockResolvedValue(address as any);
      userAddressRepository.remove.mockResolvedValue(address as any);

      const result = await service.deleteUserAddress('1', '1');

      expect(userAddressRepository.remove).toHaveBeenCalledWith(address);
      expect(result).toEqual({ message: 'Address deleted successfully' });
    });

    it('should set another address as default if deleting default address', async () => {
      const address = {
        id: '1',
        fullName: 'Address 1',
        user: { id: '1' },
        isDefault: true,
      };

      const anotherAddress = {
        id: '2',
        fullName: 'Address 2',
        user: { id: '1' },
        isDefault: false,
      };

      userAddressRepository.findOne
        .mockResolvedValueOnce(address as any)
        .mockResolvedValueOnce(anotherAddress as any);
      userAddressRepository.remove.mockResolvedValue(address as any);
      userAddressRepository.save.mockResolvedValue({
        ...anotherAddress,
        isDefault: true,
      } as any);

      await service.deleteUserAddress('1', '1');

      expect(userAddressRepository.save).toHaveBeenCalledWith({
        ...anotherAddress,
        isDefault: true,
      });
    });

    it('should throw an error if address not found', async () => {
      userAddressRepository.findOne.mockResolvedValue(null);

      await expect(service.deleteUserAddress('1', '1')).rejects.toThrow(RpcException);
    });

    it('should throw an error if user does not own the address', async () => {
      const address = {
        id: '1',
        fullName: 'Address 1',
        user: { id: '2' },
        isDefault: false,
      };

      userAddressRepository.findOne.mockResolvedValue(address as any);

      await expect(service.deleteUserAddress('1', '1')).rejects.toThrow(RpcException);
    });
  });

  describe('setDefault', () => {
    it('should set an address as default', async () => {
      const address = {
        id: '1',
        fullName: 'Address 1',
        user: { id: '1' },
        isDefault: false,
      };

      userAddressRepository.findOne.mockResolvedValue(address as any);
      userAddressRepository.update.mockResolvedValue({ affected: 1 } as any);
      userAddressRepository.save.mockResolvedValue({
        ...address,
        isDefault: true,
      } as any);

      const result = await service.setDefault('1', '1');

      expect(userAddressRepository.update).toHaveBeenCalledWith(
        { user: { id: '1' } },
        { isDefault: false },
      );
      expect(userAddressRepository.save).toHaveBeenCalled();
      expect(result.isDefault).toBe(true);
    });

    it('should throw an error if address not found', async () => {
      userAddressRepository.findOne.mockResolvedValue(null);

      await expect(service.setDefault('1', '1')).rejects.toThrow(RpcException);
    });

    it('should throw an error if user does not own the address', async () => {
      const address = {
        id: '1',
        fullName: 'Address 1',
        user: { id: '2' },
        isDefault: false,
      };

      userAddressRepository.findOne.mockResolvedValue(address as any);

      await expect(service.setDefault('1', '1')).rejects.toThrow(RpcException);
    });
  });

  describe('getDefault', () => {
    it('should retrieve the default address for a user', async () => {
      const address = {
        id: '1',
        fullName: 'Default Address',
        user: { id: '1' },
        isDefault: true,
      };

      userAddressRepository.findOne.mockResolvedValue(address as any);

      const result = await service.getDefault('1');

      expect(userAddressRepository.findOne).toHaveBeenCalledWith({
        where: { user: { id: '1' }, isDefault: true },
      });
      expect(result).toEqual(address);
    });

    it('should return null if no default address exists', async () => {
      userAddressRepository.findOne.mockResolvedValue(null);

      const result = await service.getDefault('1');

      expect(result).toBeNull();
    });
  });
});
