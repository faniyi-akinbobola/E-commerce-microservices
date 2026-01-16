import { IsString, IsStrongPassword } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({
    description: 'Current password for verification',
    example: 'OldPassword123!',
    type: String,
  })
  @IsString()
  oldPassword: string;

  @ApiProperty({
    description: 'New strong password (min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 symbol)',
    example: 'NewSecurePass456!',
    minLength: 8,
    type: String,
  })
  @IsString()
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  })
  newPassword: string;
}
