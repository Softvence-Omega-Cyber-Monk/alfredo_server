import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class UpdateProtectPlanDto {
  @ApiPropertyOptional({ description: 'Price charged for this plan', example: 30 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price?: number;

  @ApiPropertyOptional({
    description: 'Cover limit advertised for this plan',
    example: 5000,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  coverAmount?: number;

  @ApiPropertyOptional({
    description:
      'Optional Stripe Price id. Leave empty to let the checkout build the price inline.',
    example: 'price_1RuIseCiM0crZsfwqv3vZZGj',
  })
  @IsOptional()
  @IsString()
  priceId?: string;

  @ApiPropertyOptional({ description: 'Whether the plan is sellable', example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
