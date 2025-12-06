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


}
