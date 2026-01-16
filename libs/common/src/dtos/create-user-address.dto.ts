import { IsString, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserAddressDto {
  @ApiProperty({
    description: 'Full name of the recipient',
    example: 'John Doe',
    type: String,
  })
  @IsString()
  fullName: string;

  @ApiProperty({
    description: 'Contact phone number',
    example: '+1-555-123-4567',
    type: String,
  })
  @IsString()
  phone: string;

  @ApiProperty({
    description: 'Street address',
    example: '123 Main Street, Apt 4B',
    type: String,
  })
  @IsString()
  street: string;

  @ApiProperty({
    description: 'City name',
    example: 'San Francisco',
    type: String,
  })
  @IsString()
  city: string;

  @ApiProperty({
    description: 'State or province',
    example: 'California',
    type: String,
  })
  @IsString()
  state: string;

  @ApiProperty({
    description: 'Country name',
    example: 'United States',
    type: String,
  })
  @IsString()
  country: string;

  @ApiProperty({
    description: 'Postal or ZIP code',
    example: '94102',
    type: String,
  })
  @IsString()
  postalCode: string;

  @ApiPropertyOptional({
    description: 'Set as default shipping address',
    example: true,
    default: false,
    type: Boolean,
  })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
