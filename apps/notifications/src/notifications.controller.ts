import { Controller, Get } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { EventPattern, Payload } from '@nestjs/microservices';

@Controller()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @EventPattern('user_created')
  async handleUserSignup(@Payload() data: any) {
    return this.notificationsService.sendSignupEmail(data);
  }

  @EventPattern('user_logged_in')
  async handleUserLogin(@Payload() data: any) {
    return this.notificationsService.sendLoginEmail(data);
  }

  @EventPattern('send_forgot_password_email')
  async handleForgotPassword(@Payload() data: any) {
    return this.notificationsService.sendForgotPasswordEmail(data);
  }

  @EventPattern('password_changed')
  async handlePasswordChanged(@Payload() data: any) {
    return this.notificationsService.sendPasswordChangedEmail(data);
  }

  @EventPattern('password_reset_success')
  async handlePasswordResetSuccess(@Payload() data: any) {
    return this.notificationsService.sendPasswordResetSuccessEmail(data);
  }

}
