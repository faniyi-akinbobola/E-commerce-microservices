import { IsString } from 'class-validator';

export class CancelOrderDto {
  @IsString()
  orderId: string;

  @IsString()
  userId: string; // verify permissions in service
}
