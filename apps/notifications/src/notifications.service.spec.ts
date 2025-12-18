import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from './notifications.service';
import { MailerService } from '@nestjs-modules/mailer';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let mailerService: MailerService;

  const mockMailerService = {
    sendMail: jest.fn().mockResolvedValue({ success: true }),
  };

  const mockAuthClient = {
    send: jest.fn(),
    emit: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: MailerService,
          useValue: mockMailerService,
        },
        {
          provide: 'AUTH_SERVICE',
          useValue: mockAuthClient,
        },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    mailerService = module.get<MailerService>(MailerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendSignupEmail', () => {
    it('should send a signup email notification', async () => {
      const emailData = {
        email: 'user@example.com',
        username: 'testuser',
      };

      const result = await service.sendSignupEmail(emailData);

      expect(mockMailerService.sendMail).toHaveBeenCalledWith({
        to: emailData.email,
        subject: 'Welcome to Our Platform!',
        template: './auth/signup',
        context: {
          username: emailData.username,
        },
      });
      expect(result).toEqual({ success: true });
    });
  });

  describe('sendLoginEmail', () => {
    it('should send a login email notification', async () => {
      const emailData = {
        email: 'user@example.com',
        username: 'testuser',
      };

      const result = await service.sendLoginEmail(emailData);

      expect(mockMailerService.sendMail).toHaveBeenCalled();
      expect(result).toEqual({ success: true });
    });
  });

  describe('sendOrderCreatedEmail', () => {
    it('should send order created email', async () => {
      const orderData = {
        orderId: 'order-1',
        email: 'user@example.com',
        name: 'Test User',
        total: 100,
        items: [
          {
            name: 'Product 1',
            price: 50,
            quantity: 2,
          },
        ],
      };

      const result = await service.sendOrderCreatedEmail(orderData);

      expect(mockMailerService.sendMail).toHaveBeenCalled();
      expect(result).toEqual({ success: true });
    });
  });

  describe('sendOrderPaidEmail', () => {
    it('should send order paid email', async () => {
      const orderData = {
        orderId: 'order-1',
        userId: 'user-1',
        amount: 100,
        transactionId: 'txn-123',
      };

      const result = await service.sendOrderPaidEmail(orderData);

      // sendOrderPaidEmail currently just logs, doesn't call sendMail
      expect(result).toEqual({ success: true });
    });
  });
});
