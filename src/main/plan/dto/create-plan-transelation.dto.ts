import {
  IsString,
  IsOptional,
  IsArray,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePlanTranslationDto {
  @ApiProperty({ example: 'en', description: 'Language code (ISO format)' })
  @IsString()
  language: string;

  @ApiProperty({ example: 'Pro Plan', description: 'Translated plan name' })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    example: 'Get access to all premium content and features',
    description: 'Translated description of the plan',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: '1 Year',
    description: 'Translated plan duration',
  })
  @IsString()
  planDuration: string;

  @ApiProperty({
    example: 'Premium',
    description: 'Translated plan type',
  })
  @IsString()
  planType: string;

  @ApiProperty({
    example: ['Unlimited content access', 'Priority support'],
    description: 'Translated features',
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  features: string[];
}
