import { Body, Controller, Post } from '@nestjs/common';
import { LoginDto } from '@apps/common';
import { AuthService } from 'apps/auth/src/auth.service';
import { UseGuards, Get, Request } from '@nestjs/common';
import { JwtAuthGuard } from 'apps/auth/src/guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {

      constructor(private readonly authService: AuthService) {}


    @Post('login')
    login(@Body() loginDto: LoginDto) {
        // handle login
    }

    @Post('signup')
    signup(@Body() body: any) {
        // handle signup
    }

    @UseGuards(JwtAuthGuard)
    @Get('profile')
    getProfile(@Request() req) {
    // req.user.userId is set by JwtStrategy's validate method
    return this.authService.getProfile(req.user.userId);
    }
}
