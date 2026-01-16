import { Stripe } from 'stripe';
import { IsDefined, IsNotEmptyObject, IsNumber, ValidateNested } from 'class-validator';
import { CardDto } from './card.dto';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateChargeDto {
  @ApiProperty({
    description: 'Payment card details or token',
    type: CardDto,
  })
  @IsDefined()
  @ValidateNested()
  @IsNotEmptyObject()
  @Type(() => CardDto)
  card: CardDto;

  @ApiProperty({
    description: 'Payment amount in cents (e.g., 1999 = $19.99)',
    example: 1999,
    minimum: 50,
    type: Number,
  })
  @IsNumber()
  amount: number;
}
