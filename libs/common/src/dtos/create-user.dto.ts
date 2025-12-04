import { IsEmail, IsNotEmpty, IsString, IsStrongPassword, IsOptional, IsEnum, MinLength } from 'class-validator';

export enum UserRole {
    ADMIN = 'ADMIN',
    CUSTOMER = 'CUSTOMER',
    INVENTORY_MANAGER = 'INVENTORY_MANAGER',
}


export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(3)
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

}

