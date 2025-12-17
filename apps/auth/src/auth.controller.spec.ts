import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserRole } from 'common/dtos';
import e from 'express';

describe('AuthController', () => {
  let authController: AuthController;

  const mockAuthService = {
    login: jest.fn().mockImplementation((dto) => {
      return {
        accessToken: 'fake-accesstoken',
        refreshToken: 'fake refresh token',
        user: {
          id: 'sksksks',
          username: 'kaido',
          email: 'kingkaido@gmail.com',
          role: UserRole.ADMIN,
        },
      };
    }),

    signup: jest.fn().mockImplementation((dto) => {
      return {
        accessToken: 'fakeAccessToken',
        refreshToken: 'fakeRefreshToken',
        user: {
          id: 'sksksks',
          username: 'kaido',
          email: 'kingkaido@gmail.com',
          role: UserRole.ADMIN,
        },
      };
    }),

    changePassword: jest.fn().mockImplementation((userId, dto) => {
      return {
        message: `Password changed successfully`,
      };
    }),

    forgotPassword: jest.fn().mockImplementation((email: 'kaidoking75@gmail.com') => {
      return {
        message: `Password reset link has been sent to your ${email}`,
      };
    }),

    resetPassword: jest.fn().mockImplementation((dto) => {
      return {
        message: 'Password has been reset successfully',
      };
    }),

    getProfile: jest.fn().mockImplementation((id) => {
      return {
        id: 'sksksks',
        username: 'kaido',
        email: 'kingkaido@gmail.com',
        role: UserRole.ADMIN,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }),

    refreshTokens: jest.fn().mockImplementation((refreshToken) => {
      return {
        accessToken: 'fakeaccesstoken',
        refreshToken: 'fakenewrefreshtoken',
        user: {
          id: '1',
          username: 'ichiban',
          email: 'ichiban@gmail.com',
          role: UserRole.ADMIN,
        },
      };
    }),

    signOut: jest.fn().mockImplementation((userId, token) => {
      return { message: `User with id ${userId} signed out successfully` };
    }),

    checkBlacklist: jest.fn().mockImplementation((token) => {
      return {
        message: `${token} is blacklisted`,
      }
    }),

    checkUserExists: jest.fn().mockImplementation((userId)=>{
      return { exists: true };
    }),
  };

  beforeEach(async () => {
    jest.clearAllMocks(); // Reset all mocks before each test

    const app: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [AuthService],
    })
      .overrideProvider(AuthService)
      .useValue(mockAuthService)
      .compile();

    authController = app.get<AuthController>(AuthController);
  });

  describe('root', () => {
    it('should be defined', () => {
      expect(authController).toBeDefined();
    });
  });

  it('should login a user', () => {
    const dto = { username: 'kaido', email: 'kingkaido@gmail.com', password: 'fagbofagbofa' };
    expect(authController.login(dto)).toEqual({
      accessToken: 'fake-accesstoken',
      refreshToken: 'fake refresh token',
      user: {
        id: 'sksksks',
        username: 'kaido',
        email: 'kingkaido@gmail.com',
        role: UserRole.ADMIN,
      },
    });

    expect(mockAuthService.login).toHaveBeenCalledWith(dto);
  });

  it('should signup a user', () => {
    const dto = {
      username: 'kaido',
      email: 'kingkaido@gmail.com',
      password: 'yonko',
      role: UserRole.ADMIN,
    };
    expect(authController.signup(dto)).toEqual({
      accessToken: 'fakeAccessToken',
      refreshToken: 'fakeRefreshToken',
      user: {
        // id: expect.any(string),
        id: 'sksksks',
        username: 'kaido',
        email: 'kingkaido@gmail.com',
        role: UserRole.ADMIN,
      },
    });

    expect(mockAuthService.signup).toHaveBeenCalledWith(dto);
  });

  it('should get user profile', () => {
    expect(authController.getProfile({ userId: 'sksksks' })).toEqual({
      id: 'sksksks',
      username: 'kaido',
      email: 'kingkaido@gmail.com',
      role: UserRole.ADMIN,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    expect(mockAuthService.getProfile).toHaveBeenCalled();
  });

  it('should reset the password', () => {
    const dto = { newPassword: 'fakeNewPassword', token: 'faketoken' };
    expect(authController.resetPassword(dto)).toEqual({
      message: 'Password has been reset successfully',
    });
    expect(mockAuthService.resetPassword).toHaveBeenCalledWith(dto.token, dto.newPassword);
  });

  it('should send a reset password link to the email', () => {
    const dto = { email: 'kaidoking75@gmail.com' };
    expect(authController.forgotPassword(dto)).toEqual({
      message: `Password reset link has been sent to your ${dto.email}`,
    });
    expect(mockAuthService.forgotPassword).toHaveBeenCalledWith(dto.email);
  });

  it('should change password', () => {
    const userId = 'oncho';
    const dto = { oldPassword: 'sksksk', newPassword: 'slskksks' };
    expect(authController.changePassword({ userId, changePasswordDto: dto })).toEqual({
      message: `Password changed successfully`,
    });
    expect(mockAuthService.changePassword).toHaveBeenCalledWith(userId, dto);
  });

  it('should refresh token', () => {
    const refreshToken = { refreshToken: 'fakeoldrefreshtoken' };
    expect(authController.refreshTokens(refreshToken)).toEqual({
      accessToken: 'fakeaccesstoken',
      refreshToken: 'fakenewrefreshtoken',
      user: {
        id: '1',
        username: 'ichiban',
        email: 'ichiban@gmail.com',
        role: UserRole.ADMIN,
      },
    });

    expect(mockAuthService.refreshTokens).toHaveBeenCalledWith('fakeoldrefreshtoken');
  });

  it('should sign out a user', () => {
    const userId = 'sksksks';
    const token = 'token';
    expect(authController.signOut({ userId, token })).toEqual({
      message: `User with id ${userId} signed out successfully`,
    });
    expect(mockAuthService.signOut).toHaveBeenCalledWith(userId, token);
  });

  it('should check if a token is blacklisted', () => {
    const token = 'blacklistedToken';
    expect(authController.checkBlacklist({ token })).toEqual({
      message: `${token} is blacklisted`,
    });
    expect(mockAuthService.checkBlacklist).toHaveBeenCalledWith(token);
});

  it('should check if a user exists', () => {
    const userId = 'sksksks';
    expect(authController.checkUserExists({ userId })).toEqual({
      exists: true,
    });
    expect(mockAuthService.checkUserExists).toHaveBeenCalledWith(userId);
  });

  it("should throw an error when signing up a user that already exists", async () => {
    mockAuthService.signup.mockRejectedValueOnce(() => {
      throw new Error('User already exists');
    });
    await expect(authController.signup({
      username: 'kaido',
      email: 'kaido@example.com',
      password: 'yonko',
      role: UserRole.ADMIN,
    })).rejects.toThrow('User already exists');
  });

  it("should throw an error when logging in with invalid credentials", async () => {
    mockAuthService.login.mockRejectedValueOnce(() => {
      throw new Error('Invalid credentials');
    });
    await expect(authController.login({
      email: 'kaido@example.com',
      password: 'yonko',
    })).rejects.toThrow('Invalid credentials');
  });

  it("should throw an unauthorized error when accessing profile without valid token", async () => {
    mockAuthService.getProfile.mockRejectedValueOnce(() => {
      throw new Error('Unauthorized');
    });
    await expect(authController.getProfile({ userId: 'invalidUserId' })).rejects.toThrow('Unauthorized'); 

});

it("should throw an error when accessing protected routes with an invalid token", async () => {
  mockAuthService.getProfile.mockRejectedValueOnce(() => {
    throw new Error('Invalid token');
  });
  await expect(authController.getProfile({ userId: 'invalidUserId' })).rejects.toThrow('Invalid token');
});

it("should throw an error when a user tries to access another user's profile", async () => {
  mockAuthService.getProfile.mockRejectedValueOnce(() => {
    throw new Error('Forbidden: You can only access your own profile');
  });
  await expect(authController.getProfile({ userId: 'anotherUserId' })).rejects.toThrow('Forbidden: You can only access your own profile');
});

it("should throw an error when a user tries to access an admin-only route", async () => {
  mockAuthService.getProfile.mockRejectedValueOnce(() => {
    throw new Error('Forbidden: Admins only');
  });
  await expect(authController.getProfile({ userId: 'regularUserId' })).rejects.toThrow('Forbidden: Admins only');
});

it("should throw an error when a non-existent user tries to log in", async () => {
  mockAuthService.login.mockRejectedValueOnce(() => {
    throw new Error('User not found');
  });
  await expect(authController.login({
    email: 'nonexistent@example.com',
    password: 'password123',
  })).rejects.toThrow('User not found');
});

it("should throw an error when resetting password with an invalid token", async () => {
  mockAuthService.resetPassword.mockRejectedValueOnce(() => {
    throw new Error('Invalid or expired token');
  });
  await expect(authController.resetPassword({
    newPassword: 'newPassword123',
    token: 'invalidToken',
  })).rejects.toThrow('Invalid or expired token');
});

it("should throw an error when requesting password reset for a non-existent email", async () => {
  mockAuthService.forgotPassword.mockRejectedValueOnce(() => {
    throw new Error('Email not found');
  });
  await expect(authController.forgotPassword({ email: 'nonexistent@example.com' })).rejects.toThrow('Email not found'); 
});

it("should throw an error when changing password with incorrect old password", async () => {
  mockAuthService.changePassword.mockRejectedValueOnce(() => {
    throw new Error('Incorrect old password');
  });
  await expect(authController.changePassword({ 
    userId: 'sksksks', 
    changePasswordDto: { oldPassword: 'wrongOldPassword', newPassword: 'newSecurePassword' } 
  })).rejects.toThrow('Incorrect old password');

});

it("should throw an error when refreshing tokens with an invalid refresh token", async () => {
  mockAuthService.refreshTokens.mockRejectedValueOnce(() => {
    throw new Error('Invalid refresh token');
  });
  await expect(authController.refreshTokens({ refreshToken: 'invalidRefreshToken' })).rejects.toThrow('Invalid refresh token');
});

it("should throw an error when signing out with an invalid token", async () => {
  mockAuthService.signOut.mockRejectedValueOnce(() => {
    throw new Error('Invalid token');
  });
  await expect(authController.signOut({ userId: 'sksksks', token: 'invalidToken' })).rejects.toThrow('Invalid token');
});

it("should throw an error when checking blacklist with an invalid token", async () => {
  mockAuthService.checkBlacklist.mockRejectedValueOnce(() => {
    throw new Error('Invalid token');
  });
  await expect(authController.checkBlacklist({ token: 'invalidToken' })).rejects.toThrow('Invalid token');
});

it("should throw an error when the input data is invalid", async () => {
  mockAuthService.signup.mockRejectedValueOnce(() => {
    throw new Error('Invalid input data');
  });
  await expect(authController.signup({
    username: '',
    email: 'invalidemail',
    password: 'short',
    role: UserRole.ADMIN,
  })).rejects.toThrow('Invalid input data');  
});

it("should throw an error when trying to access a non-existent user's profile", async () => {
  mockAuthService.getProfile.mockRejectedValueOnce(() => {
    throw new Error('User not found');
  });
  await expect(authController.getProfile({ userId: 'nonExistentUserId' })).rejects.toThrow('User not found');

});

it("should throw an error when trying to change password for a non-existent user", async () => {
  mockAuthService.changePassword.mockRejectedValueOnce(() => {
    throw new Error('User not found');
  });
  await expect(authController.changePassword({ 
    userId: 'nonExistentUserId', 
    changePasswordDto: { oldPassword: 'someOldPassword', newPassword: 'newSecurePassword' } 
  })).rejects.toThrow('User not found');
});

it("should throw an error when trying to refresh tokens for a non-existent user", async () => {
  mockAuthService.refreshTokens.mockRejectedValueOnce(() => {
    throw new Error('User not found');
  });
  await expect(authController.refreshTokens({ refreshToken: 'someRefreshToken' })).rejects.toThrow('User not found');
});

it("should throw an error when trying to sign out a non-existent user", async () => {
  mockAuthService.signOut.mockRejectedValueOnce(() => {
    throw new Error('User not found');
  });
  await expect(authController.signOut({ userId: 'nonExistentUserId', token: 'someToken' })).rejects.toThrow('User not found');
});

it("should throw an error when trying to check blacklist for a non-existent user", async () => {
  mockAuthService.checkBlacklist.mockRejectedValueOnce(() => {
    throw new Error('User not found');
  });
  await expect(authController.checkBlacklist({ token: 'someToken' })).rejects.toThrow('User not found');
});

it("should throw an error when trying to sign out without a token", async () => {
  mockAuthService.signOut.mockRejectedValueOnce(() => {
    throw new Error('Token is required for sign out');
  });
  await expect(authController.signOut({ userId: 'sksksks', token: '' })).rejects.toThrow('Token is required for sign out');
});

it("should throw an error when trying to refresh tokens without a refresh token", async () => {
  mockAuthService.refreshTokens.mockRejectedValueOnce(() => {
    throw new Error('Refresh token is required');
  });
  await expect(authController.refreshTokens({ refreshToken: '' })).rejects.toThrow('Refresh token is required');   
});

});