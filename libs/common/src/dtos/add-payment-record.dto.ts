import { IsString, IsNumber } from 'class-validator';

export class AddPaymentRecordDto {
  @IsString()
  orderId: string;

  @IsString()
  paymentMethod: string;

  @IsNumber()
  amount: number;

  @IsString()
  transactionId: string;

  @IsString()
  paymentStatus: string;
}
