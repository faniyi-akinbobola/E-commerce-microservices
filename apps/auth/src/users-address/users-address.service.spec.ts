import { Test, TestingModule } from '@nestjs/testing';
import { UsersAddressService } from './users-address.service';

describe('UsersAddressService', () => {
  let service: UsersAddressService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersAddressService],
    }).compile();

    service = module.get<UsersAddressService>(UsersAddressService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
