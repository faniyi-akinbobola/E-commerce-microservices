import { IsCreditCard, IsNumber, IsString } from "class-validator";
import { Stripe } from "stripe";

export class CardDto{

    @IsString()
    cvc?: string;

    @IsNumber()
    exp_month?: number;


    @IsNumber()
    exp_year?: number;

    networks?: Stripe.PaymentMethodCreateParams.Card.Networks;

    @IsCreditCard()
    number?: string;

    @IsString()
    token?: string;
}