import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class CreateStripePaymentDto {
  @ApiProperty({ example: 'price_1RuIseCiM0crZsfwqv3vZZGj' })
  @IsString()
  priceId: string;

  @ApiProperty({ example: '1503ad99-f64b-4181-8bdb-767def84a517' })
  @IsString()
  planId: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  planDuration: number;
}
