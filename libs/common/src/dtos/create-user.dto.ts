import { IsEmail, IsNotEmpty, IsString, IsStrongPassword, IsOptional, IsEnum } from 'class-validator';

export enum UserRole {
    ADMIN = 'ADMIN',
    CUSTOMER = 'CUSTOMER',
    INVENTORY_MANAGER = 'INVENTORY_MANAGER',
}


export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    username: string;

    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsStrongPassword({
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
    })
    password: string;

    @IsOptional()
    @IsEnum(UserRole)
    role?: UserRole;

    // addresses are created separately, so not included here
}

