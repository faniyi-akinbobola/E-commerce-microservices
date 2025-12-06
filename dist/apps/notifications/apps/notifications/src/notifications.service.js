"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var NotificationsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const common_2 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const mailer_1 = require("@nestjs-modules/mailer");
let NotificationsService = NotificationsService_1 = class NotificationsService {
    constructor(mailerService) {
        this.mailerService = mailerService;
        this.logger = new common_1.Logger(NotificationsService_1.name);
    }
    async sendSignupEmail(data) {
        const { email, username } = data;
        try {
            await this.mailerService.sendMail({
                to: email,
                subject: 'Welcome to Our Platform!',
                template: './signup',
                context: {
                    name,
                },
            });
            this.logger.log(`Signup email sent successfully to ${email}`);
            return { success: true };
        }
        catch (error) {
            this.logger.error(`Failed to send signup email to ${email}`, error.stack);
            return { success: false, error: error.message };
        }
    }
    async sendLoginEmail(data) {
        const { email, time } = data;
        await this.mailerService.sendMail({
            to: email,
            subject: 'New Login Alert 🚨',
            template: './login',
            context: {
                email,
                time,
            },
        });
        this.logger.log(`Login alert sent to ${email}`);
        return { success: true };
    }
    async sendPasswordResetEmail(data) {
        const { email, resetToken } = data;
        await this.mailerService.sendMail({
            to: email,
            subject: 'Reset Your Password 🔐',
            template: './password-reset',
            context: {
                resetUrl: `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`,
            },
        });
        this.logger.log(`Password reset email sent to ${email}`);
        return { success: true };
    }
};
exports.NotificationsService = NotificationsService;
__decorate([
    (0, common_2.Inject)('NOTIFICATION_SERVICE'),
    __metadata("design:type", microservices_1.ClientProxy)
], NotificationsService.prototype, "notificationClient", void 0);
exports.NotificationsService = NotificationsService = NotificationsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [mailer_1.MailerService])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map