import { Stripe } from 'stripe';
import { IsDefined, IsNotEmptyObject, IsNumber, ValidateNested } from 'class-validator';
import { CardDto } from './card.dto';
import { Type } from 'class-transformer';

export class CreateChargeDto {
    @IsDefined()
    @ValidateNested()
    @IsNotEmptyObject()
    @Type(() => CardDto)
    card: CardDto;
    
    @IsNumber()
    amount: number;
}