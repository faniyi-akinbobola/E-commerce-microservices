import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserRole } from 'common/dtos';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ValidationError } from 'class-validator';

describe('UsersController', () => {
  let controller: UsersController;

  const mockUsersService = {
    createUser: jest.fn().mockImplementation((dto) => ({
      id: 'ssddd',
      ...dto,
    })),
    getUsers: jest.fn().mockImplementation(() => [
      { id: 'a', username: 'Luffy', email: 'luffy@example.com', role: UserRole.ADMIN },
      { id: 'b', username: 'Zoro', email: 'zoro@example.com', role: UserRole.CUSTOMER },
    ]),

    updateUser: jest.fn().mockImplementation((id, requesterId, updateUserDto) => {
      return {
        id: 'ssddd',
        requesterId: 'ffff',
        ...updateUserDto,
      };
    }),

    deleteUser: jest.fn().mockImplementation((id, requesterId, token) => {
      return {
        message: `user with ${id} deleted successfully`,
      };
    }),

    getUserById: jest.fn().mockImplementation((id) => {
      return {
        id: 'ssddd',
        username: 'Bankai',
        email: 'Bankai@gmail.com',
        role: UserRole.INVENTORY_MANAGER,
      };
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [UsersService],
    })
      .overrideProvider(UsersService)
      .useValue(mockUsersService)
      .compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call the createuser method', () => {
    const dto = {
      username: 'Kaido',
      email: 'kaido@gmail.com',
      password: 'Kaidoking75#',
      role: UserRole.ADMIN,
    };
    expect(controller.createUser(dto)).toEqual({
      id: expect.any(String),
      username: dto.username,
      email: dto.email,
      password: dto.password,
      role: dto.role,
    });

    expect(mockUsersService.createUser).toHaveBeenCalledWith(dto);
  });

  it('should get all users', () => {
    expect(controller.getUsers()).toEqual([
      { id: 'a', username: 'Luffy', email: 'luffy@example.com', role: UserRole.ADMIN },
      { id: 'b', username: 'Zoro', email: 'zoro@example.com', role: UserRole.CUSTOMER },
    ]);
    expect(mockUsersService.getUsers).toHaveBeenCalled();
  });

  it('should get user by id', () => {
    expect(controller.getUserById({ id: 'ssddd' })).toEqual({
      id: 'ssddd',
      username: 'Bankai',
      email: 'Bankai@gmail.com',
      role: UserRole.INVENTORY_MANAGER,
    });

    expect(mockUsersService.getUserById).toHaveBeenCalledWith('ssddd');
  });

  it('should update the user', () => {
    const dto = { username: 'brook', email: 'brookyonko@gmail.com' };
    expect(controller.updateUser({ id: 'ssddd', requesterId: 'ffff', updateUserDto: dto })).toEqual(
      {
        id: 'ssddd',
        requesterId: 'ffff',
        ...dto,
      },
    );
    expect(mockUsersService.updateUser).toHaveBeenCalledWith('ssddd', 'ffff', dto);
  });

  it('should delete the user', () => {
    expect(controller.deleteUser({ id: 'ssddd', requesterId: 'ffff' })).toEqual({
      message: `user with ssddd deleted successfully`,
    });
    expect(mockUsersService.deleteUser).toHaveBeenCalledWith('ssddd', 'ffff', undefined);
  });

  it('should throw user not found error', () => {
    mockUsersService.getUserById.mockImplementationOnce(() => {
      throw new NotFoundException('User not found');
    });
    expect(() => controller.getUserById({ id: 'ssddd' })).toThrow('User not found');
  });

  it('should not create a user with missing required fields', async () => {
    const dto = {
      username: 'Kaido',
      // email is missing
      password: 'Kaidoking75#',
      role: UserRole.ADMIN,
    } as any;
    mockUsersService.createUser.mockRejectedValueOnce(
      new BadRequestException('user missing required fields'),
    );
    await expect(controller.createUser(dto)).rejects.toThrow(BadRequestException);
  });

  it('should return an empty array if no user exists', () => {
    mockUsersService.getUsers.mockImplementation(() => {
      throw new NotFoundException('users not found');
    });
    expect(() => controller.getUsers()).toThrow('users not found');
  });

  it('should throw an error if trying to delete a non-existent user', () => {
    mockUsersService.deleteUser.mockImplementation(() => {
      throw new NotFoundException("Can't delete a non-existent user");
    });
    expect(() =>
      controller.deleteUser({ id: 'ssddd', requesterId: 'ffff', token: undefined }),
    ).toThrow("Can't delete a non-existent user");
  });

  it('should fail to create a user with duplicate email', async () => {
    const dto = {
      username: 'Kaido',
      email: 'kaidoking75@gmail.com',
      password: 'Kaidoking75#',
      role: UserRole.ADMIN,
    };
    mockUsersService.createUser.mockRejectedValueOnce(() => {
      throw new BadRequestException('User with email already exists');
    });
    await expect(controller.createUser(dto)).rejects.toThrow(BadRequestException);
  });

  it('should fail to update a user with invalid fields', async () => {
    const dto = {
      username: '',
      email: '',
      password: 'Kaidoking75#',
      role: UserRole.ADMIN,
    };
    mockUsersService.updateUser.mockRejectedValueOnce(() => {
      throw new BadRequestException('The input fields are invalid');
    });
    await expect(
      controller.updateUser({ id: 'ssddd', requesterId: 'ffff', updateUserDto: dto }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should fail to get with an invalid id', () => {
    mockUsersService.getUserById.mockImplementationOnce(() => {
      throw new BadRequestException("Can't fetch user with invalid id");
    });
    expect(() => controller.getUserById({ id: 'invalid-id' })).toThrow(BadRequestException);
  });

 

});
