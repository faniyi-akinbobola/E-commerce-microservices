import { Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { LoginDto, ChangePasswordDto, ForgotPasswordDto, ResetPasswordDto, RefreshTokenDto, CreateUserDto } from '@apps/common';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern({ cmd: 'login' })
  login(@Payload() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @MessagePattern({ cmd: 'signup' })
  signup(@Payload() createUserDto: CreateUserDto) {
    return this.authService.signup(createUserDto);
  }

  @MessagePattern({ cmd: 'changePassword' })
  changePassword(@Payload() payload: { userId: string; changePasswordDto: ChangePasswordDto }) {
    return this.authService.changePassword(payload.userId, payload.changePasswordDto);
  }

  @MessagePattern({ cmd: 'forgotPassword' })
  forgotPassword(@Payload() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @MessagePattern({ cmd: 'resetPassword' })
  resetPassword(@Payload() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto.userId, resetPasswordDto.token, resetPasswordDto.newPassword);
  }

  @MessagePattern({ cmd: 'getProfile' })
  getProfile(@Payload() payload: { userId: string }) {
    return this.authService.getProfile(payload.userId);
  }

  @MessagePattern({ cmd: 'refreshTokens' })
  refreshTokens(@Payload() payload: RefreshTokenDto) {
    return this.authService.refreshTokens(payload.refreshToken);
  }

  @MessagePattern({ cmd: 'signOut' })
  signOut(@Payload() payload: { userId: string }) {
    return this.authService.signOut(payload.userId);
  }

}
