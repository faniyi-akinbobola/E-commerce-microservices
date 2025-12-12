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

  @EventPattern('order_created')
  async handleOrderCreated(@Payload() data: any) {
    return this.notificationsService.sendOrderCreatedEmail(data);
  }

  @EventPattern('order_paid')
  async handleOrderPaid(@Payload() data: any) {
    return this.notificationsService.sendOrderPaidEmail(data);
  }

  @EventPattern('order_payment_failed')
  async handleOrderPaymentFailed(@Payload() data: any) {
    return this.notificationsService.sendOrderPaymentFailedEmail(data);
  }

}
