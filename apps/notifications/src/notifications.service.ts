import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';


interface SignupPayload {
  email: string;
  username: string;
}

interface LoginPayload {
  email: string;
  username?: string;
}

interface ForgotPasswordPayload {
  email: string;
  name: string;
  resetUrl: string;
  expiresIn: number;
}

interface PasswordChangedPayload {
  email: string;
  name: string;
}

interface PasswordResetSuccessPayload {
  email: string;
  name: string;
}

interface OrderCreatedPayload {
  orderId: string;
  userId: string;
  totalPrice: number;
  items: number;
}

interface OrderPaidPayload {
  orderId: string;
  userId: string;
  amount: number;
  transactionId: string;
}

interface OrderPaymentFailedPayload {
  orderId: string;
  userId: string;
  amount: number;
  reason: string;
}

@Injectable()
export class NotificationsService {

    private readonly logger = new Logger(NotificationsService.name);
    constructor(private readonly mailerService: MailerService){}

  /** ===========================
   *  SEND SIGNUP EMAIL
   *  =========================== **/
  async sendSignupEmail(data: SignupPayload) {
    const { email, username } = data;

    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Welcome to Our Platform!',
        template: './auth/signup',
        context: {
          username,
        },
      });

      this.logger.log(`Signup email sent successfully to ${email}`);
      return { success: true };
    } catch (error) {
      this.logger.error(`Failed to send signup email to ${email}`, error.stack);
      return { success: false, error: error.message };
    }
  }

  /** ===========================
   *  SEND LOGIN EMAIL
   *  =========================== **/
  async sendLoginEmail(data: LoginPayload) {
    const { email, username } = data;

    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'New Login Alert 🚨',
        template: './auth/login',
        context: {
          email,
          time: new Date().toLocaleString(),
          username: username || 'User',
        },
      });

      this.logger.log(`Login alert sent to ${email}`);
      return { success: true };
    } catch (error) {
      this.logger.error(`Failed to send login email to ${email}`, error.stack);
      return { success: false, error: error.message };
    }
  }

  /** ===========================
   *  SEND FORGOT PASSWORD EMAIL
   *  =========================== **/
  async sendForgotPasswordEmail(data: ForgotPasswordPayload) {
    const { email, name, resetUrl, expiresIn } = data;

    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Reset Your Password 🔐',
        template: './auth/forgot-password',
        context: {
          name,
          resetUrl,
          expiresIn,
        },
      });

      this.logger.log(`Forgot password email sent to ${email}`);
      return { success: true };
    } catch (error) {
      this.logger.error(`Failed to send forgot password email to ${email}`, error.stack);
      return { success: false, error: error.message };
    }
  }

  /** ===========================
   *  SEND PASSWORD CHANGED EMAIL
   *  =========================== **/
  async sendPasswordChangedEmail(data: PasswordChangedPayload) {
    const { email, name } = data;

    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Password Changed Successfully 🔐',
        template: './auth/password-changed',
        context: {
          name,
        },
      });

      this.logger.log(`Password changed notification sent to ${email}`);
      return { success: true };
    } catch (error) {
      this.logger.error(`Failed to send password changed email to ${email}`, error.stack);
      return { success: false, error: error.message };
    }
  }

  /** ===========================
   *  SEND PASSWORD RESET SUCCESS EMAIL
   *  =========================== **/
  async sendPasswordResetSuccessEmail(data: PasswordResetSuccessPayload) {
    const { email, name } = data;

    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Password Reset Successful ✔️',
        template: './auth/reset-password',
        context: {
          name,
        },
      });

      this.logger.log(`Password reset success notification sent to ${email}`);
      return { success: true };
    } catch (error) {
      this.logger.error(`Failed to send password reset success email to ${email}`, error.stack);
      return { success: false, error: error.message };
    }
  }

  /** ===========================
   *  SEND ORDER CREATED EMAIL
   *  =========================== **/
  async sendOrderCreatedEmail(data: OrderCreatedPayload) {
    const { orderId, userId, totalPrice, items } = data;

    try {
      // In a real app, you'd fetch user email from userId
      // For now, we'll log it
      this.logger.log(`Order created notification - OrderID: ${orderId}, UserID: ${userId}, Total: $${totalPrice}, Items: ${items}`);
      
      // TODO: Fetch user email and send actual email
      // await this.mailerService.sendMail({
      //   to: userEmail,
      //   subject: 'Order Confirmation 🛍️',
      //   template: './order/order-created',
      //   context: {
      //     orderId,
      //     totalPrice,
      //     items,
      //   },
      // });

      return { success: true };
    } catch (error) {
      this.logger.error(`Failed to send order created email for order ${orderId}`, error.stack);
      return { success: false, error: error.message };
    }
  }

  /** ===========================
   *  SEND ORDER PAID EMAIL
   *  =========================== **/
  async sendOrderPaidEmail(data: OrderPaidPayload) {
    const { orderId, userId, amount, transactionId } = data;

    try {
      this.logger.log(`Order paid notification - OrderID: ${orderId}, UserID: ${userId}, Amount: $${amount}, Transaction: ${transactionId}`);
      
      // TODO: Fetch user email and send actual email
      // await this.mailerService.sendMail({
      //   to: userEmail,
      //   subject: 'Payment Successful ✅',
      //   template: './order/order-paid',
      //   context: {
      //     orderId,
      //     amount,
      //     transactionId,
      //   },
      // });

      return { success: true };
    } catch (error) {
      this.logger.error(`Failed to send order paid email for order ${orderId}`, error.stack);
      return { success: false, error: error.message };
    }
  }

  /** ===========================
   *  SEND ORDER PAYMENT FAILED EMAIL
   *  =========================== **/
  async sendOrderPaymentFailedEmail(data: OrderPaymentFailedPayload) {
    const { orderId, userId, amount, reason } = data;

    try {
      this.logger.log(`Order payment failed notification - OrderID: ${orderId}, UserID: ${userId}, Amount: $${amount}, Reason: ${reason}`);
      
      // TODO: Fetch user email and send actual email
      // await this.mailerService.sendMail({
      //   to: userEmail,
      //   subject: 'Payment Failed ❌',
      //   template: './order/order-payment-failed',
      //   context: {
      //     orderId,
      //     amount,
      //     reason,
      //   },
      // });

      return { success: true };
    } catch (error) {
      this.logger.error(`Failed to send payment failed email for order ${orderId}`, error.stack);
      return { success: false, error: error.message };
    }
  }


}
