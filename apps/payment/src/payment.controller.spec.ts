import { Test, TestingModule } from '@nestjs/testing';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';

describe('PaymentController', () => {
  let paymentController: PaymentController;

  const paymentServiceMock = {
    createCharge: jest.fn().mockImplementation(() => ({ id: 'charge-123' })),
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [PaymentController],
      providers: [PaymentService],
    })
      .overrideProvider(PaymentService)
      .useValue(paymentServiceMock)
      .compile();

    paymentController = app.get<PaymentController>(PaymentController);
  });

  describe('root', () => {
    it('should be defined', () => {
      expect(paymentController).toBeDefined();
    });
  });
});
