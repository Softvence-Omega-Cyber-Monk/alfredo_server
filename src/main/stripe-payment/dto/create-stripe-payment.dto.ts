import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateStripePaymentDto {
  @ApiProperty({ example: 'price_1RuIseCiM0crZsfwqv3vZZGj' })
  @IsString()
  @IsNotEmpty()
  priceId: string;

  @ApiProperty({ example: '1503ad99-f64b-4181-8bdb-767def84a517' })
  @IsString()
  @IsNotEmpty()
  planId: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  planDuration: number;
}
