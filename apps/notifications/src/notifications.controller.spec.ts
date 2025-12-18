import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';

describe('NotificationsController', () => {
  let notificationsController: NotificationsController;

  const notificationsServiceMock = {
    sendSignupEmail: jest.fn().mockImplementation(() => {}),
    sendLoginEmail: jest.fn().mockImplementation(() => {}),
    sendForgotPasswordEmail: jest.fn().mockImplementation(() => {}),
    sendPasswordChangedEmail: jest.fn().mockImplementation(() => {}),
    sendPasswordResetSuccessEmail: jest.fn().mockImplementation(() => {}),
    sendOrderCreatedEmail: jest.fn().mockImplementation(() => {}),
    sendOrderPaidEmail: jest.fn().mockImplementation(() => {}),
    sendOrderPaymentFailedEmail: jest.fn().mockImplementation(() => {}),
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [NotificationsService],
    })
      .overrideProvider(NotificationsService)
      .useValue(notificationsServiceMock)
      .compile();

    notificationsController = app.get<NotificationsController>(NotificationsController);
  });

  describe('root', () => {
    it('should be defined', () => {
      expect(notificationsController).toBeDefined();
    });
  });

  describe('handleUserSignup', () => {
    it('should call handleUserSignup with correct data', async () => {
      const data = { userId: '123' };
      await notificationsController.handleUserSignup(data);
      expect(notificationsServiceMock.sendSignupEmail).toHaveBeenCalledWith(data);
    });
  });

  describe('handleUserLogin', () => {
    it('should call handleUserLogin with correct data', async () => {
      const data = { userId: '123' };
      await notificationsController.handleUserLogin(data);
      expect(notificationsServiceMock.sendLoginEmail).toHaveBeenCalledWith(data);
    });
  });

  describe('handleForgotPassword', () => {
    it('should call handleForgotPassword with correct data', async () => {
      const data = { userId: '123' };
      await notificationsController.handleForgotPassword(data);
      expect(notificationsServiceMock.sendForgotPasswordEmail).toHaveBeenCalledWith(data);
    });
  });

  describe('handlePasswordChanged', () => {
    it('should call handlePasswordChanged with correct data', async () => {
      const data = { userId: '123' };
      await notificationsController.handlePasswordChanged(data);
      expect(notificationsServiceMock.sendPasswordChangedEmail).toHaveBeenCalledWith(data);
    });
  });

  describe('handlePasswordResetSuccess', () => {
    it('should call handlePasswordResetSuccess with correct data', async () => {
      const data = { userId: '123' };
      await notificationsController.handlePasswordResetSuccess(data);
      expect(notificationsServiceMock.sendPasswordResetSuccessEmail).toHaveBeenCalledWith(data);
    });
  });

  describe('handleOrderCreated', () => {
    it('should call handleOrderCreated with correct data', async () => {
      const data = { orderId: '456' };
      await notificationsController.handleOrderCreated(data);
      expect(notificationsServiceMock.sendOrderCreatedEmail).toHaveBeenCalledWith(data);
    });
  });

  describe('handleOrderPaid', () => {
    it('should call handleOrderPaid with correct data', async () => {
      const data = { orderId: '456' };
      await notificationsController.handleOrderPaid(data);
      expect(notificationsServiceMock.sendOrderPaidEmail).toHaveBeenCalledWith(data);
    });
  });

  describe('handleOrderPaymentFailed', () => {
    it('should call handleOrderPaymentFailed with correct data', async () => {
      const data = { orderId: '456' };
      await notificationsController.handleOrderPaymentFailed(data);
      expect(notificationsServiceMock.sendOrderPaymentFailedEmail).toHaveBeenCalledWith(data);
    });
  });
});
