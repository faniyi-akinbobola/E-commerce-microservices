import { IsEmail, IsNotEmpty, IsString, IsStrongPassword } from "class-validator";


export class UpdateUserDto {
    @IsString()
    username?: string;

    @IsEmail()
    email?: string;
    
    @IsStrongPassword()
    password?: string;
}

