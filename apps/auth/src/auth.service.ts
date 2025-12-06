import { Injectable, UnauthorizedException, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './users/entities/user.entity';
import { MoreThan, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UsersService } from './users/users.service';
import { ChangePasswordDto } from '@apps/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto, CreateUserDto, ResetPasswordDto} from '@apps/common';
import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { randomBytes } from 'crypto';
import { ConfigService } from '@nestjs/config';
import { Blacklist } from './blacklist/blacklist.entity';


@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private jwtService: JwtService,
    @Inject('NOTIFICATION_SERVICE') private readonly notificationClient: ClientProxy,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    @InjectRepository(Blacklist) private readonly blacklistRepository: Repository<Blacklist>,
  ) {}


  async login(loginDto: LoginDto) {
    // Find user by email
    const user = await this.userRepository.findOne({ where: { email: loginDto.email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT tokens
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: '1h',
    });

    // Generate new refresh token
    const refreshToken = randomBytes(32).toString('hex');
    user.refreshToken = refreshToken;
    
    await this.userRepository.save(user);

    this.notificationClient.emit('user_logged_in', { userId: user.id, username: user.username, email: user.email });

    return {
      accessToken,
      refreshToken: user.refreshToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    };
  }

  async signup(createUserDto: CreateUserDto) {
    // Delegate user creation to UsersService
    const user = await this.usersService.createUser(createUserDto);

    // Emit notification
  this.notificationClient.emit('user_created', { userId: user.id, username: user.username, email: user.email });

    // Generate JWT token
    const payload = { sub: user.id, username: user.username, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    await this.userRepository.save(user);


    return {
      accessToken,
      refreshToken: user.refreshToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    };
  }

  // Get profile
  async getProfile(userId: string) {
  // Find the user by ID
  const user = await this.userRepository.findOne({ where: { id: userId } });
  if (!user) {
    throw new NotFoundException('User not found');
  }

  // Return user profile (omit sensitive fields like password)
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    // Add other fields as needed
  };
}

    //  Refresh tokens
// async refreshTokens(refreshToken: string) {
//   let payload: any;
//   try {
//     payload = this.jwtService.verify(refreshToken, { secret: process.env.REFRESH_SECRET });
//   } catch (err) {
//     throw new UnauthorizedException('Invalid or expired refresh token');
//   }

//   // Find the user by ID from token payload
//   const user = await this.userRepository.findOne({ where: { id: payload.sub } });
//   if (!user) {
//     throw new NotFoundException('User not found');
//   }

//   // Generate new access and refresh tokens
//   const accessToken = this.jwtService.sign(
//     { sub: user.id, email: user.email, role: user.role },
//     { secret: process.env.JWT_SECRET, expiresIn: '15m' }
//   );
//   const newRefreshToken = this.jwtService.sign(
//     { sub: user.id, email: user.email },
//     { secret: process.env.REFRESH_SECRET, expiresIn: '7d' }
//   );

//   return {
//     accessToken,
//     refreshToken: newRefreshToken,
//     user: {
//       id: user.id,
//       username: user.username,
//       email: user.email,
//       role: user.role,
//     },
//   };
// }

async refreshTokens(refreshToken: string) {
  // Find user by refresh token
  const user = await this.userRepository.findOne({ where: { refreshToken } });
  
  if (!user) {
    throw new UnauthorizedException('Invalid or expired refresh token');
  }

  // Generate new access token
  const accessToken = this.jwtService.sign(
    { sub: user.id, email: user.email, role: user.role },
    { secret: this.configService.get('JWT_SECRET'), expiresIn: '1h' },
  );

  // Generate new refresh token
  const newRefreshToken = randomBytes(32).toString('hex');
  user.refreshToken = newRefreshToken;
  await this.userRepository.save(user);

  return {
    accessToken,
    refreshToken: newRefreshToken,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    },
  };
}


  // Change password
// async changePassword(userId: string, dto: ChangePasswordDto) {
//   // Find the user by ID
//   const user = await this.userRepository.findOne({ where: { id: userId } });
//   if (!user) {
//     throw new NotFoundException('User not found');
//   }

//   // Compare old password
//   const valid = await bcrypt.compare(dto.oldPassword, user.password);
//   if (!valid) {
//     throw new UnauthorizedException('Old password is incorrect');
//   }

//   // Hash new password
//   const newHash = await bcrypt.hash(dto.newPassword, 10);

//   // Update password
//   user.password = newHash;
//   await this.userRepository.save(user);

//   this.notificationClient.emit('password_changed', { userId: user.id,name:user.username, email: user.email });

//   return { message: 'Password updated successfully' };
// }
  async changePassword(userId: string, dto: ChangePasswordDto) {
    const { oldPassword, newPassword } = dto;

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    // Verify old password
    const valid = await bcrypt.compare(oldPassword, user.password);
    if (!valid) throw new UnauthorizedException('Old password is incorrect');

    // Hash new password
    user.password = await bcrypt.hash(newPassword, 10);

    await this.userRepository.save(user);

    // Optional notification
    this.notificationClient.emit('password_changed', {
      userId: user.id,
      email: user.email,
      name: user.username,
    });

    return { message: 'Password changed successfully' };
  }

  //  Forgot password (send reset token)
// async forgotPassword(email: string) {
//   // Find user by email
//   const user = await this.userRepository.findOne({ where: { email } });
//   if (!user) {
//     throw new NotFoundException('User not found');
//   }

//   // Generate reset token (valid for 10 minutes)
//   const token = this.jwtService.sign(
//     { sub: user.id },
//     { secret: process.env.RESET_SECRET, expiresIn: '10m' }
//   );

//   // Optionally, emit an event to an email microservice here
//   // this.emailClient.emit('forgot_password', { email, token });
//   this.notificationClient.emit('forgot_password', { userId: user.id,name:user.username, email: user.email, token,  });

//   return { message: 'Reset email sent', token }; // Remove token in production, only send via email
// }

async forgotPassword(email: string) {
  const user = await this.userRepository.findOne({ where: { email } });

  if (!user) throw new NotFoundException('User not found');

  const token = randomBytes(32).toString('hex');
  const expiresIn = 15; // minutes

  const hashedToken = await bcrypt.hash(token, 10);

  user.resetToken = hashedToken;
  user.resetTokenExpires = new Date(Date.now() + expiresIn * 60 * 1000);

  await this.userRepository.save(user);

  const resetUrl = `${this.configService.get('FRONTEND_URL')}/reset-password?token=${token}`;

  // publish RMQ event
  this.notificationClient.emit('send_forgot_password_email', {
    name: user.username,
    email: user.email,
    resetUrl,
    expiresIn,
  });

  // TODO: Remove token from response in production (for testing only)
  return { message: 'Password reset link sent', token };
}


  //  Reset password
// async resetPassword(token: string, newPassword: string) {
//   // Verify the reset token
//   let payload: any;
//   try {
//     payload = this.jwtService.verify(token, { secret: process.env.RESET_SECRET });
//   } catch (err) {
//     throw new UnauthorizedException('Invalid or expired reset token');
//   }

//   // Find the user by ID from token payload
//   const user = await this.userRepository.findOne({ where: { id: payload.sub } });
//   if (!user) {
//     throw new NotFoundException('User not found');
//   }

//   // Hash the new password
//   const newHash = await bcrypt.hash(newPassword, 10);

//   // Update password
//   user.password = newHash;
//   await this.userRepository.save(user);

//   this.notificationClient.emit('password_reset', { userId: user.id,name: user.username, email: user.email });

//   return { message: 'Password reset successfully' };
// }

async resetPassword(token: string, newPassword: string) {
  // Find user with valid reset token (not expired)
  const users = await this.userRepository.find({
    where: { resetTokenExpires: MoreThan(new Date()) },
  });

  let user = null;
  
  // Check which user has the matching token
  for (const u of users) {
    if (u.resetToken) {
      const isValid = await bcrypt.compare(token, u.resetToken);
      if (isValid) {
        user = u;
        break;
      }
    }
  }

  if (!user) {
    throw new BadRequestException('Invalid or expired reset token');
  }

  // Hash new password
  user.password = await bcrypt.hash(newPassword, 10);

  // Invalidate reset token
  user.resetToken = null;
  user.resetTokenExpires = null;

  await this.userRepository.save(user);

  // Emit success email event
  this.notificationClient.emit('password_reset_success', {
    email: user.email,
    name: user.username,
  });

  return { message: 'Password has been reset successfully' };
}

  // Sign out (client-side token invalidation)
  async signOut(userId: string, jwtToken: string) {
    // In a JWT-based system, logout is typically handled client-side by removing the token
    // This endpoint can be used for logging purposes or future token blacklisting
    
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Optional: Emit logout event for logging/analytics
    this.notificationClient.emit('user_logged_out', {
      userId: user.id,
      email: user.email,
      timestamp: new Date(),
    });

    // In your signOut method
    await this.blacklistRepository.save({ token: jwtToken });

    return { message: 'Successfully signed out' };
  }

  // Check if token is blacklisted
  async checkBlacklist(token: string) {
    const isBlacklisted = await this.blacklistRepository.findOne({ where: { token } });
    return { isBlacklisted: !!isBlacklisted };
  }

  // Check if user exists (for deleted user validation)
  async checkUserExists(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    return { exists: !!user };
  }


    // For password reset
  // @Column({ nullable: true })
  // resetToken: string;

  // @Column({ nullable: true, type: 'timestamp' })
  // resetTokenExpires: Date;

}



