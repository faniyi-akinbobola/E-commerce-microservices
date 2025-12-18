import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Blacklist } from '../blacklist/blacklist.entity';
import { Repository } from 'typeorm';
import { RpcException } from '@nestjs/microservices';

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: jest.Mocked<Repository<User>>;
  let blacklistRepository: jest.Mocked<Repository<Blacklist>>;

  const mockUsersRepository = {
    create: jest.fn().mockImplementation((dto) => dto),
    save: jest.fn().mockImplementation((user) => Promise.resolve({ id: '1', ...user })),
    remove: jest.fn().mockImplementation((id) => Promise.resolve({ id })),
    find: jest.fn().mockImplementation(() => Promise.resolve([])),
    findOne: jest.fn().mockImplementation((id) => Promise.resolve({ id })),
    preload: jest.fn().mockImplementation((id, dto) => Promise.resolve({ id, ...dto })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUsersRepository,
        },
        {
          provide: getRepositoryToken(Blacklist),
          useValue: mockUsersRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get(getRepositoryToken(User));
    blacklistRepository = module.get(getRepositoryToken(Blacklist));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a user', async () => {
    const dto = {
      email: 'test@example.com',
      username: 'testuser',
      password: 'password123',
    } as any;

    userRepository.findOne.mockResolvedValue(null);
    userRepository.create.mockReturnValue(dto);
    userRepository.save.mockResolvedValue({ id: '1', ...dto });

    const result = await service.createUser(dto);

    expect(userRepository.findOne).toHaveBeenCalled();
    expect(userRepository.create).toHaveBeenCalled();
    expect(userRepository.save).toHaveBeenCalled();
    expect(result).toHaveProperty('id');
  });

  it('should throw error if user already exists', async () => {
    userRepository.findOne.mockResolvedValue({ id: '1' } as User);

    await expect(
      service.createUser({
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
      } as any),
    ).rejects.toThrow(RpcException);
  });


  it('should delete an existing user', async () => {
    const user = { id: '1' } as User;

    userRepository.findOne.mockResolvedValue(user);
    userRepository.remove.mockResolvedValue(user);
    blacklistRepository.save.mockResolvedValue({ token: 'jwt' } as any);

    const result = await service.deleteUser('1', '1', 'jwt');

    expect(userRepository.findOne).toHaveBeenCalledWith({
      where: { id: '1' },
    });

    expect(blacklistRepository.save).toHaveBeenCalledWith({
      token: 'jwt',
    });

    expect(userRepository.remove).toHaveBeenCalledWith(user);

    expect(result).toEqual(user);
  });

  it('should throw an error when user tries to delete another user', async () => {
    await expect(service.deleteUser('1', '2')).rejects.toThrow(RpcException);
  });

  it('should update a user successfully', async () => {
    const updateUserDto = { username: 'newname' };
    const updatedUser = { id: '1', username: 'newname' } as User;
    userRepository.preload.mockResolvedValue(updatedUser);
    userRepository.save.mockResolvedValue(updatedUser);

    const result = await service.updateUser('1', '1', updateUserDto);

    expect(userRepository.preload).toHaveBeenCalledWith({
      id: '1',
      ...updateUserDto,
    });
    expect(userRepository.save).toHaveBeenCalledWith(updatedUser);
    expect(result).toEqual(updatedUser);
  });


it('should get a user by id', async () => {
  const user = {
    id: '1',
    username: 'testuser',
    password: 'hashedpassword',
  } as User;

  userRepository.findOne.mockResolvedValue(user);

  const result = await service.getUserById('1');

  expect(userRepository.findOne).toHaveBeenCalledWith({
    where: { id: '1' },
  });

  expect(result).toEqual({
    id: '1',
    username: 'testuser',
  });

  expect(result).not.toHaveProperty('password');
});

it('should throw if user not found', async () => {
  userRepository.findOne.mockResolvedValue(null);

  await expect(service.getUserById('1')).rejects.toThrow(RpcException);
});

it('should throw error if user does not exist', async () => {
  userRepository.preload.mockResolvedValue(null);

  await expect(
    service.updateUser('1', '1', { username: 'newname' })
  ).rejects.toThrow(RpcException);
});

it('should throw error if requester is not the target user', async () => {
  await expect(
    service.updateUser('1', '2', { username: 'newname' })
  ).rejects.toThrow(RpcException);
});

});
