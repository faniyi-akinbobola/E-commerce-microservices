import { Test, TestingModule } from '@nestjs/testing';
import { PaymentService } from './payment.service';
import { ConfigService } from '@nestjs/config';
import { CircuitBreakerService } from '@apps/common';
import { RpcException } from '@nestjs/microservices';

describe('PaymentService', () => {
  let service: PaymentService;
  let configService: ConfigService;
  let circuitBreakerService: CircuitBreakerService;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'STRIPE_SECRET_KEY') return 'sk_test_fake_key';
      return null;
    }),
  };

  const mockCircuitBreaker = {
    fire: jest.fn(),
    fallback: jest.fn(),
  };

  const mockCircuitBreakerService = {
    createCircuitBreaker: jest.fn().mockReturnValue(mockCircuitBreaker),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: CircuitBreakerService,
          useValue: mockCircuitBreakerService,
        },
      ],
    }).compile();

    service = module.get<PaymentService>(PaymentService);
    configService = module.get<ConfigService>(ConfigService);
    circuitBreakerService = module.get<CircuitBreakerService>(CircuitBreakerService);

    // Initialize the circuit breaker for the service
    service.onModuleInit();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createCharge', () => {
    it('should create a charge successfully', async () => {
      const data = {
        amount: 1000,
        currency: 'ngn',
        userId: 'user-1',
        description: 'Test payment',
        metadata: { orderId: 'order-1' },
        idempotencyKey: 'idempotency-key-123',
      };

      const paymentIntentResponse = {
        id: 'pi_123',
        amount: 1000,
        currency: 'ngn',
        status: 'succeeded',
      };

      mockCircuitBreaker.fire.mockResolvedValue(paymentIntentResponse);

      const result = await service.createCharge(data);

      expect(mockCircuitBreaker.fire).toHaveBeenCalledWith(
        expect.objectContaining({
          paymentData: expect.objectContaining({
            amount: 1000,
            currency: 'ngn',
          }),
          options: expect.objectContaining({
            idempotencyKey: 'idempotency-key-123',
          }),
        }),
      );
      expect(result).toEqual({
        transactionId: 'pi_123',
        status: 'succeeded',
        amount: 1000,
        currency: 'ngn',
        idempotencyKey: 'idempotency-key-123',
      });
    });

    it('should throw error if charge fails', async () => {
      const data = {
        amount: 1000,
        currency: 'ngn',
        userId: 'user-1',
        description: 'Test payment',
        metadata: {},
        idempotencyKey: 'idempotency-key-123',
      };

      mockCircuitBreaker.fire.mockRejectedValue({
        type: 'card_error',
        code: 'card_declined',
        message: 'Card declined',
      });

      await expect(service.createCharge(data)).rejects.toThrow(RpcException);
    });
  });
});
