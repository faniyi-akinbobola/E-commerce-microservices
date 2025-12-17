import { Test, TestingModule } from '@nestjs/testing';
import { UsersAddressController } from './users-address.controller';
import { UsersAddressService } from './users-address.service';
import { UserRole } from '@apps/common';
import { BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';

describe('UsersAddressController', () => {
  let controller: UsersAddressController;

  const mockUsersAddressService = {
    createUserAddress: jest.fn().mockImplementation((userId, dto) => {
      return {
        fullname: 'Test User',
        addressLine1: '123 Test St',
        addressLine2: 'Apt 4B',
        city: 'Test City',
        state: 'Test State',
        postalCode: '12345',
        country: 'Test Country',
        phoneNumber: '123-456-7890',
        user: {
          id: 'ssddd',
          username: 'Bankai',
          email: 'Bankai@gmail.com',
          role: UserRole.INVENTORY_MANAGER,
        },
      };
    }),

    getUserAddresses: jest.fn().mockImplementation((id) => [
      {
        fullname: 'Test User',
        addressLine1: '123 Test St',
        addressLine2: 'Apt 4B',
        city: 'Test City',
        state: 'Test State',
        postalCode: '12345',
        country: 'Test Country',
        phoneNumber: '123-456-7890',
      },
      {
        fullname: 'Another User',
        addressLine1: '456 Another St',
        addressLine2: 'Suite 5C',
        city: 'Another City',
        state: 'Another State',
        postalCode: '67890',
        country: 'Another Country',
        phoneNumber: '098-765-4321',
      },
    ]),

    updateUserAddress: jest.fn().mockImplementation((id, userId, dto) => {
      return {
        fullname: 'Test User',
        addressLine1: '123 Test St',
        addressLine2: 'Apt 4B',
        city: 'Test City',
        state: 'Test State',
        postalCode: '12345',
        country: 'Test Country',
        phoneNumber: '123-456-7890',
      };
    }),

    deleteUserAddress: jest.fn().mockImplementation((id, userId) => {
      return {
        message: `Address with id ${id} deleted successfully`,
      };
    }),

    getUserAddressById: jest.fn().mockImplementation((id) => {
      return {
        fullname: 'Test User',
        addressLine1: '123 Test St',
        addressLine2: 'Apt 4B',
        city: 'Test City',
        state: 'Test State',
        postalCode: '12345',
        country: 'Test Country',
        phoneNumber: '123-456-7890',
      };
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersAddressController],
      providers: [UsersAddressService],
    })
      .overrideProvider(UsersAddressService)
      .useValue(mockUsersAddressService)
      .compile();

    controller = module.get<UsersAddressController>(UsersAddressController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call the createUserAddress method', () => {
    const dto = {
      fullName: 'Test User',
      street: '123 Test St',
      addressLine2: 'Apt 4B',
      city: 'Test City',
      state: 'Test State',
      postalCode: '12345',
      country: 'Test Country',
      phone: '123-456-7890',
    };
    const userId = 'ssddd';
    const result = controller.createUserAddress({ userId, ...dto });
    expect(result).toEqual({
      fullname: dto.fullName,
      addressLine1: dto.street,
      addressLine2: dto.addressLine2,
      city: dto.city,
      state: dto.state,
      postalCode: dto.postalCode,
      country: dto.country,
      phoneNumber: dto.phone,
      user: {
        id: 'ssddd',
        username: 'Bankai',
        email: 'Bankai@gmail.com',
        role: UserRole.INVENTORY_MANAGER,
      },
    });
    expect(mockUsersAddressService.createUserAddress).toHaveBeenCalledWith(userId, dto);
  });

  it('should get all addresses for a user', () => {
    const userId = 'ssddd';
    expect(controller.getUserAddresses({ userId })).toEqual([
      {
        fullname: 'Test User',
        addressLine1: '123 Test St',
        addressLine2: 'Apt 4B',
        city: 'Test City',
        state: 'Test State',
        postalCode: '12345',
        country: 'Test Country',
        phoneNumber: '123-456-7890',
      },
      {
        fullname: 'Another User',
        addressLine1: '456 Another St',
        addressLine2: 'Suite 5C',
        city: 'Another City',
        state: 'Another State',
        postalCode: '67890',
        country: 'Another Country',
        phoneNumber: '098-765-4321',
      },
    ]);
    expect(mockUsersAddressService.getUserAddresses).toHaveBeenCalledWith(userId);
  });

  it('should get address by id for a user', () => {
    const userId = 'ssddd';
    const addressId = 'addr123';
    expect(controller.getUserAddressById({ id: addressId, userId })).toEqual({
      fullname: 'Test User',
      addressLine1: '123 Test St',
      addressLine2: 'Apt 4B',
      city: 'Test City',
      state: 'Test State',
      postalCode: '12345',
      country: 'Test Country',
      phoneNumber: '123-456-7890',
    });
    expect(mockUsersAddressService.getUserAddressById).toHaveBeenCalledWith(addressId, userId);
  });

  it('should update an address for a user', () => {
    const userId = 'ssddd';
    const addressId = 'addr123';
    const dto = {
      fullname: 'Test User',
      addressLine1: '123 Test St',
      addressLine2: 'Apt 4B',
      city: 'Test City',
      state: 'Test State',
      postalCode: '12345',
      country: 'Test Country',
      phoneNumber: '123-456-7890',
    };
    expect(
      controller.updateUserAddress({ id: addressId, userId, updateUserAddressDto: dto }),
    ).toEqual({
      fullname: 'Test User',
      addressLine1: '123 Test St',
      addressLine2: 'Apt 4B',
      city: 'Test City',
      state: 'Test State',
      postalCode: '12345',
      country: 'Test Country',
      phoneNumber: '123-456-7890',
    });
    expect(mockUsersAddressService.updateUserAddress).toHaveBeenCalledWith(addressId, userId, dto);
  });

  it('should delete an address for a user', () => {
    const userId = 'ssddd';
    const addressId = 'addr123';
    expect(controller.deleteUserAddress({ id: addressId, userId })).toEqual({
      message: `Address with id ${addressId} deleted successfully`,
    });
    expect(mockUsersAddressService.deleteUserAddress).toHaveBeenCalledWith(addressId, userId);
  });

  it('should handle service errors gracefully', () => {
    const userId = 'ssddd';
    const addressId = 'addr123';
    mockUsersAddressService.getUserAddressById.mockImplementationOnce(() => {
      throw new Error('Not found');
    });
    expect(() => controller.getUserAddressById({ id: addressId, userId })).toThrow('Not found');
  });

  it('should return empty array if user has no addresses', () => {
    mockUsersAddressService.getUserAddresses.mockReturnValueOnce([]);
    const userId = 'no-address-user';
    expect(controller.getUserAddresses({ userId })).toEqual([]);
  });

  it('should throw error if user is not owner of the address', () => {
    const userId = 'ssddd';
    const addressId = 'addr123';
    mockUsersAddressService.getUserAddressById.mockImplementationOnce(() => {
      throw new Error('You do not own this address');
    });
    expect(() => controller.getUserAddressById({ id: addressId, userId })).toThrow(
      'You do not own this address',
    );
  });

  it('should not create a user address with missing fields', async () => {
    const dto = {
      fullName: 'Test User',
      street: '123 Test St',
      addressLine2: 'Apt 4B',
      city: 'Test City',
      state: 'Test State',
    } as any;
    const userId = 'ssddd';
    mockUsersAddressService.createUserAddress.mockRejectedValueOnce(() => {
      throw new BadRequestException('address missing fields');
    });
    await expect(controller.createUserAddress({ userId, ...dto })).rejects.toThrow(
      BadRequestException,
    );
  });

  it("should throw an error if you try to get an address that doesn't exist", () => {
    const addressId = 'addr123';
    const userId = "ssss"
    mockUsersAddressService.getUserAddressById.mockImplementationOnce(() => {
      throw new NotFoundException('Address not found!');
    });
    expect(() => controller.getUserAddressById({id: addressId, userId })).toThrow(NotFoundException);
  });

  it("should throw an error if you are trying to delete an address that doesn't exist", ()=>{
    const addressId = 'addr123';
    const userId = "ssss"
    mockUsersAddressService.deleteUserAddress.mockImplementationOnce(()=>{
      throw new BadRequestException("address doesn't exist");
    })
    expect(()=> controller.deleteUserAddress({id: addressId, userId })).toThrow(BadRequestException)
  })

  it("should throw an error if you try to update an address that doesn't exist",async ()=>{
    const userId = 'ssddd';
    const addressId = 'addr123';
    const dto = {
      fullname: 'Test User',
      addressLine1: '123 Test St',
      addressLine2: 'Apt 4B',
      city: 'Test City',
      state: 'Test State',
      postalCode: '12345',
      country: 'Test Country',
      phoneNumber: '123-456-7890',
    };
    mockUsersAddressService.updateUserAddress.mockRejectedValueOnce(()=>{
      throw new BadRequestException("Address doesn't exist")
    })
    await expect(controller.updateUserAddress({ id: addressId, userId, updateUserAddressDto: dto })).rejects.toThrow(BadRequestException);
  });

  it("should not create an address with invalid fields", async  ()=>{
    const invalidFormatDto = {
  fullName: '', // empty string, should not be allowed
  street: '456 Main St',
  addressLine2: 'Suite 100',
  city: 'Metropolis',
  state: 'NY',
  postalCode: 'abcde', // not a valid postal code
  country: 'USA',
  phone: 'not-a-phone-number', // invalid phone format
};
const userId = "ssddd";
    mockUsersAddressService.createUserAddress.mockRejectedValueOnce(()=>{
      throw new BadRequestException("Invalid Address Fields!")
    })
    await expect(controller.createUserAddress({ userId: 'ssddd', ...invalidFormatDto })).rejects.toThrow(BadRequestException)
  });

   it("should not create an address with duplicate fields", async  ()=>{
const dto = {
  fullName: 'Jane Doe',
  street: '456 Main St',
  addressLine2: 'Suite 100',
  city: 'Metropolis',
  state: 'NY',
  postalCode: '10001',
  country: 'USA',
  phone: '555-123-4567',
};
const userId = "ssddd";
    mockUsersAddressService.createUserAddress.mockRejectedValueOnce(()=>{
      throw new BadRequestException("Address already exists!")
    })
    await expect(controller.createUserAddress({ userId: 'ssddd', ...dto })).rejects.toThrow(BadRequestException)
  });

  it('should not allow a user to update an address they do not own', async () => {
  const addressId = 'addr123';
  const userId = 'not-the-owner';
  const dto = {
    fullname: 'Test User',
    addressLine1: '123 Test St',
    addressLine2: 'Apt 4B',
    city: 'Test City',
    state: 'Test State',
    postalCode: '12345',
    country: 'Test Country',
    phoneNumber: '123-456-7890',
  };
  mockUsersAddressService.updateUserAddress.mockRejectedValueOnce(() => {
    throw new ForbiddenException('You do not have permission to update this address')
  });
  await expect(
    controller.updateUserAddress({ id: addressId, userId, updateUserAddressDto: dto })
  ).rejects.toThrow(ForbiddenException);
});


});
