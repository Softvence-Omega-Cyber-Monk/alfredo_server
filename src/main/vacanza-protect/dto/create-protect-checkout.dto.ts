import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { ProtectPlanType, ProtectPurchaseSource } from '@prisma/client';

export class CreateProtectCheckoutDto {
  @ApiProperty({
    description: 'Which Vacanza Protect plan the customer is buying',
    enum: ProtectPlanType,
    example: ProtectPlanType.PER_TRIP,
  })
  @IsEnum(ProtectPlanType)
  planType: ProtectPlanType;

  @ApiPropertyOptional({
    description:
      'Buyer email. Required for guests — Vacanza Protect is sold without an account. Ignored when a logged in user buys from the dashboard.',
    example: 'owner@gmail.com',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    description: 'Buyer name',
    example: 'Maria Papadopoulou',
  })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional({
    description: 'Address of the home that gets covered',
    example: 'Ermou 12, Athens',
  })
  @IsOptional()
  @IsString()
  propertyAddress?: string;

  @ApiPropertyOptional({
    description: 'How many trips to cover. Only used for the PER_TRIP plan.',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(20)
  @Type(() => Number)
  trips?: number;

  @ApiPropertyOptional({
    description: 'Where the checkout was started from, used for reporting only',
    enum: ProtectPurchaseSource,
    default: ProtectPurchaseSource.LANDING,
  })
  @IsOptional()
  @IsEnum(ProtectPurchaseSource)
  source?: ProtectPurchaseSource;
}
