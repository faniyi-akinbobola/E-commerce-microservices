import { Controller, Get } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreateChargeDto } from '@apps/common';

@Controller()
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}


  @MessagePattern({cmd : 'create_charge'})
  createCharge(@Payload() data: any){
    return this.paymentService.createCharge(data)
  }
}
