import {
  IsNumber,
  IsOptional,
  IsString,
  IsArray,
  ValidateNested,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PlanStatus } from '@prisma/client';
import { CreatePlanTranslationDto } from './create-plan-transelation.dto';


export class CreatePlanDto {
  @ApiProperty({
    example: 19.99,
    description: 'The base price of the plan in USD',
  })
  @IsNumber()
  price: number;

  @ApiProperty({
    example: 'price_1ABC123xyz',
    description: 'The Stripe priceId for the plan',
  })
  @IsString()
  priceId: string;

  
   @ApiProperty({example:"true",description:"Set plan populer or not"})
  @IsBoolean()
  @IsOptional()
  is_populer: boolean



  @ApiPropertyOptional({
    enum: PlanStatus,
    example: PlanStatus.ACTIVE,
    description: 'Status of the plan (ACTIVE/INACTIVE)',
  })
  @IsOptional()
  @IsEnum(PlanStatus)
  status?: PlanStatus; // ✅ default should be in Prisma, not DTO

  @ApiProperty({
    type: [CreatePlanTranslationDto],
    description: 'Translations of the plan in multiple languages',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePlanTranslationDto)
  translations: CreatePlanTranslationDto[];
}
