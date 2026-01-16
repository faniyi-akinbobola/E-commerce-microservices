import { IsCreditCard, IsNumber, IsString, IsOptional } from 'class-validator';
import { Stripe } from 'stripe';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CardDto {
  @ApiPropertyOptional({
    description: 'Card CVC/CVV code',
    example: '123',
    minLength: 3,
    maxLength: 4,
    type: String,
  })
  @IsOptional()
  @IsString()
  cvc?: string;

  @ApiPropertyOptional({
    description: 'Card expiration month (1-12)',
    example: 12,
    minimum: 1,
    maximum: 12,
    type: Number,
  })
  @IsOptional()
  @IsNumber()
  exp_month?: number;

  @ApiPropertyOptional({
    description: 'Card expiration year',
    example: 2026,
    type: Number,
  })
  @IsOptional()
  @IsNumber()
  exp_year?: number;

  @ApiPropertyOptional({
    description: 'Card network preferences',
  })
  networks?: Stripe.PaymentMethodCreateParams.Card.Networks;

  @ApiPropertyOptional({
    description: 'Credit card number',
    example: '4242424242424242',
    type: String,
  })
  @IsOptional()
  @IsCreditCard()
  number?: string;

  @ApiPropertyOptional({
    description: 'Stripe card token (alternative to providing card details)',
    example: 'tok_visa',
    type: String,
  })
  @IsOptional()
  @IsString()
  token?: string;
}
