import { ApiProperty } from "@nestjs/swagger";

export class CreateStripePaymentDto {
    @ApiProperty({ example: 'price_1RuIsDCiM0crZsfwlscvEMHT' })
  priceId: string;

  @ApiProperty({ example: 'https://example.com/success' })
  successUrl: string;

  @ApiProperty({ example: 'https://example.com/cancel' })
  cancelUrl: string;
}
