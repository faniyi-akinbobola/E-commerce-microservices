import { IsEmail, IsOptional, IsString, IsStrongPassword } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({
    description: 'New username',
    example: 'johndoe_updated',
    type: String,
  })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiPropertyOptional({
    description: 'New email address',
    example: 'newemail@example.com',
    type: String,
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    description: 'New password (must be strong)',
    example: 'NewPassword123!',
    minLength: 8,
    type: String,
  })
  @IsOptional()
  @IsStrongPassword()
  password?: string;

  @ApiPropertyOptional({
    description: 'User role (Admin only)',
    example: 'CUSTOMER',
    enum: ['ADMIN', 'CUSTOMER', 'INVENTORY_MANAGER'],
    type: String,
  })
  @IsOptional()
  @IsString()
  role?: string;
}
