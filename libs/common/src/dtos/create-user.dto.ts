import { IsEmail, IsNotEmpty, IsString, IsStrongPassword } from "class-validator";


export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    username: string;

    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsStrongPassword()
    password: string;
}

