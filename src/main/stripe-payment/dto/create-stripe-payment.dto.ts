// create-stripe-payment.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateStripePaymentDto {
  @ApiProperty({
    description: 'Stripe Price ID for the plan',
    example: 'price_1RuIseCiM0crZsfwqv3vZZGj',
  })
  @IsString()
  @IsNotEmpty()
  priceId: string;

  @ApiProperty({
    description: 'Internal Plan ID from the database',
    example: '1503ad99-f64b-4181-8bdb-767def84a517',
  })
  @IsString()
  @IsNotEmpty()
  planId: string;

  @ApiProperty({
    description: 'Duration of the plan in years (e.g., 1 or 2)',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  planDuration: number;
}
