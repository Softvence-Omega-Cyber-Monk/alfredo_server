import { ApiProperty } from "@nestjs/swagger";

export class CreateStripePaymentDto {
    @ApiProperty({ example: 'price_1RuIsDCiM0crZsfwlscvEMHT' })
  priceId: string;

  @ApiProperty({ example: '1503ad99-f64b-4181-8bdb-767def84a517' })
  planId: string;

  @ApiProperty({ example: 1 })
  planDuration: number
}
