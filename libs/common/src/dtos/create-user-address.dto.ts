import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class CreateUserAddressDto {
  @IsString()
  fullName: string;

  @IsString()
  phone: string;

  @IsString()
  street: string;

  @IsString()
  city: string;

  @IsString()
  state: string;

  @IsString()
  country: string;

  @IsString()
  postalCode: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
