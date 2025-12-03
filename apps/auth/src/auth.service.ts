import { Injectable, UnauthorizedException, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './users/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UsersService } from './users/users.service';
import { ChangePasswordDto } from '@apps/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto, CreateUserDto } from '@apps/common';

@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private jwtService: JwtService
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

    // Generate JWT token
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    };
  }

  async signup(createUserDto: CreateUserDto) {
    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: [{ email: createUserDto.email }, { username: createUserDto.username }],
    });
    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Create user
    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });
    await this.userRepository.save(user);

    // Generate JWT token
    const payload = { sub: user.id, username: user.username, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
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
async refreshTokens(refreshToken: string) {
  let payload: any;
  try {
    payload = this.jwtService.verify(refreshToken, { secret: process.env.REFRESH_SECRET });
  } catch (err) {
    throw new UnauthorizedException('Invalid or expired refresh token');
  }

  // Find the user by ID from token payload
  const user = await this.userRepository.findOne({ where: { id: payload.sub } });
  if (!user) {
    throw new NotFoundException('User not found');
  }

  // Generate new access and refresh tokens
  const accessToken = this.jwtService.sign(
    { sub: user.id, email: user.email, role: user.role },
    { secret: process.env.JWT_SECRET, expiresIn: '15m' }
  );
  const newRefreshToken = this.jwtService.sign(
    { sub: user.id, email: user.email },
    { secret: process.env.REFRESH_SECRET, expiresIn: '7d' }
  );

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
async changePassword(userId: string, dto: ChangePasswordDto) {
  // Find the user by ID
  const user = await this.userRepository.findOne({ where: { id: userId } });
  if (!user) {
    throw new NotFoundException('User not found');
  }

  // Compare old password
  const valid = await bcrypt.compare(dto.oldPassword, user.password);
  if (!valid) {
    throw new UnauthorizedException('Old password is incorrect');
  }

  // Hash new password
  const newHash = await bcrypt.hash(dto.newPassword, 10);

  // Update password
  user.password = newHash;
  await this.userRepository.save(user);

  return { message: 'Password updated successfully' };
}

  //  Forgot password (send reset token)
async forgotPassword(email: string) {
  // Find user by email
  const user = await this.userRepository.findOne({ where: { email } });
  if (!user) {
    throw new NotFoundException('User not found');
  }

  // Generate reset token (valid for 10 minutes)
  const token = this.jwtService.sign(
    { sub: user.id },
    { secret: process.env.RESET_SECRET, expiresIn: '10m' }
  );

  // Optionally, emit an event to an email microservice here
  // this.emailClient.emit('forgot_password', { email, token });

  return { message: 'Reset email sent', token }; // Remove token in production, only send via email
}

  //  Reset password
async resetPassword(token: string, newPassword: string) {
  // Verify the reset token
  let payload: any;
  try {
    payload = this.jwtService.verify(token, { secret: process.env.RESET_SECRET });
  } catch (err) {
    throw new UnauthorizedException('Invalid or expired reset token');
  }

  // Find the user by ID from token payload
  const user = await this.userRepository.findOne({ where: { id: payload.sub } });
  if (!user) {
    throw new NotFoundException('User not found');
  }

  // Hash the new password
  const newHash = await bcrypt.hash(newPassword, 10);

  // Update password
  user.password = newHash;
  await this.userRepository.save(user);

  return { message: 'Password reset successfully' };
}


}



