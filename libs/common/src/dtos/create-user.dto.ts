import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  IsOptional,
  IsEnum,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum UserRole {
  ADMIN = 'ADMIN',
  CUSTOMER = 'CUSTOMER',
  INVENTORY_MANAGER = 'INVENTORY_MANAGER',
}

export class CreateUserDto {
  @ApiProperty({
    description: 'Username (minimum 3 characters)',
    example: 'johndoe',
    minLength: 3,
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  username: string;

  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@example.com',
    type: String,
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Strong password (min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 symbol)',
    example: 'SecurePass123!',
    minLength: 8,
    type: String,
  })
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  })
  password: string;

  @ApiPropertyOptional({
    description: 'User role',
    enum: UserRole,
    default: UserRole.CUSTOMER,
    example: UserRole.CUSTOMER,
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
