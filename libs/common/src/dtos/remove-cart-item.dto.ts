import { IsString, IsNotEmpty } from 'class-validator';

export class RemoveCartItemDto {
  @IsString()
  @IsNotEmpty()
  productId: string;
}
