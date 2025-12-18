import { IsCreditCard, IsNumber, IsString, IsOptional } from 'class-validator';
import { Stripe } from 'stripe';

export class CardDto {
  @IsOptional()
  @IsString()
  cvc?: string;

  @IsOptional()
  @IsNumber()
  exp_month?: number;

  @IsOptional()
  @IsNumber()
  exp_year?: number;

  networks?: Stripe.PaymentMethodCreateParams.Card.Networks;

  @IsOptional()
  @IsCreditCard()
  number?: string;

  @IsOptional()
  @IsString()
  token?: string;
}
