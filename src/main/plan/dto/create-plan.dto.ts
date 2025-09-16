import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsArray,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PlanType, PlanStatus } from '@prisma/client';

export class CreatePlanDto {
  @ApiProperty({
    example: 'Pro Plan',
    description: 'The name of the subscription plan',
  })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    example: 'Get access to all premium content and features',
    description: 'A short description of the plan',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: '1 Year',
    description: 'Plan duration',
  })
  @IsString()
  plan_duration: string; // required

  @ApiProperty({
    example: 19.99,
    description: 'The price of the plan in USD',
  })
  @IsNumber()
  price: number;

  @ApiProperty({
    example: 'price_1ABC123xyz',
    description: 'The priceId of the plan in Stripe',
  })
  @IsString()
  priceId: string; // fixed

  @ApiProperty({
    example: [
      'Unlimited content access',
      'Priority support',
      'Community access',
    ],
    description: 'List of features included in the plan',
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  features: string[];

  @ApiProperty({
    enum: PlanType,
    example: PlanType.YEARLY,
    description: 'Type of the plan (YEARLY)',
  })
  @IsEnum(PlanType)
  planType: PlanType;

  @ApiPropertyOptional({
    enum: PlanStatus,
    example: PlanStatus.ACTIVE,
    description: 'Status of the plan (e.g. ACTIVE, INACTIVE)',
  })
  @IsOptional()
  @IsEnum(PlanStatus)
  status?: PlanStatus = PlanStatus.ACTIVE;
}
