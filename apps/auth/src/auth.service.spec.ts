import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from './users/users.service';
import { JwtService } from '@nestjs/jwt';
import { RpcException } from '@nestjs/microservices';
import * as bcrypt from 'bcrypt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './users/entities/user.entity';
import { Blacklist } from './blacklist/blacklist.entity';
import { ConfigService } from '@nestjs/config';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;

  const mockUser = {
    id: 'user-1',
    username: 'testuser',
    email: 'test@example.com',
    password: 'hashedpassword',
    role: 'CUSTOMER',
  };

  const mockUsersService = {
    findByEmail: jest.fn(),
    findById: jest.fn(),
    createUser: jest.fn(),
    updateUser: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    findOneBy: jest.fn(),
  };

  const mockBlacklistRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
  };

  const mockNotificationClient = {
    emit: jest.fn(),
    send: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue('test-secret'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(Blacklist),
          useValue: mockBlacklistRepository,
        },
        {
          provide: 'NOTIFICATION_SERVICE',
          useValue: mockNotificationClient,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const dto = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };

      mockUsersService.createUser.mockResolvedValue({
        ...mockUser,
        refreshToken: 'refresh-token',
      } as any);
      mockJwtService.sign.mockReturnValue('jwt-token');
      mockUserRepository.save.mockResolvedValue(mockUser as any);

      const result = await service.signup(dto as any);

      expect(mockUsersService.createUser).toHaveBeenCalledWith(dto);
      expect(mockJwtService.sign).toHaveBeenCalled();
      expect(result).toBeDefined();
      expect(result).toHaveProperty('accessToken');
    });

    it('should throw error if user already exists', async () => {
      const dto = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };

      mockUsersService.createUser.mockRejectedValue(new RpcException('User already exists'));

      await expect(service.signup(dto as any)).rejects.toThrow();
    });
  });

  describe('login', () => {
    it('should login a user with valid credentials', async () => {
      const dto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const hashedPassword = await bcrypt.hash('password123', 10);
      mockUserRepository.findOne.mockResolvedValue({
        ...mockUser,
        password: hashedPassword,
        refreshToken: 'refresh-token',
      } as any);
      mockJwtService.sign.mockReturnValue('jwt-token');
      mockUserRepository.save.mockResolvedValue(mockUser as any);

      jest.spyOn(bcrypt, 'compare').mockImplementation(async () => true);

      const result = await service.login(dto as any);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { email: dto.email } });
      expect(mockJwtService.sign).toHaveBeenCalled();
      expect(result).toHaveProperty('accessToken');
    });

    it('should throw error if user not found', async () => {
      const dto = {
        email: 'test@example.com',
        password: 'password123',
      };

      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.login(dto as any)).rejects.toThrow();
    });

    it('should throw error if password is invalid', async () => {
      const dto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      const hashedPassword = await bcrypt.hash('password123', 10);
      mockUserRepository.findOne.mockResolvedValue({
        ...mockUser,
        password: hashedPassword,
      } as any);

      jest.spyOn(bcrypt, 'compare').mockImplementation(async () => false);

      await expect(service.login(dto as any)).rejects.toThrow();
    });
  });

  describe('refreshTokens', () => {
    it('should refresh an access token', async () => {
      const refreshToken = 'refresh-token';

      mockUserRepository.findOne.mockResolvedValue({
        ...mockUser,
        refreshToken: refreshToken,
      } as any);
      mockJwtService.sign.mockReturnValue('new-jwt-token');
      mockUserRepository.save.mockResolvedValue({
        ...mockUser,
        refreshToken: 'new-refresh-token',
      } as any);

      const result = await service.refreshTokens(refreshToken);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { refreshToken } });
      expect(mockJwtService.sign).toHaveBeenCalled();
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });

    it('should throw error if refresh token is invalid', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.refreshTokens('invalid-token')).rejects.toThrow();
    });
  });
});
