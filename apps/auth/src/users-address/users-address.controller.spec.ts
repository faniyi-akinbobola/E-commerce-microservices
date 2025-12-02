import { Test, TestingModule } from '@nestjs/testing';
import { UsersAddressController } from './users-address.controller';

describe('UsersAddressController', () => {
  let controller: UsersAddressController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersAddressController],
    }).compile();

    controller = module.get<UsersAddressController>(UsersAddressController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
