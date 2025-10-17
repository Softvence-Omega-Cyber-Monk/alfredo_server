import { PartialType } from '@nestjs/swagger';
import { CreatePlanDto } from './create-plan.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsArray, IsString, IsBoolean } from 'class-validator';
import { PlanStatus } from '@prisma/client';

export class UpdatePlanDto extends PartialType(CreatePlanDto) {
  @ApiPropertyOptional({
    enum: PlanStatus,
    example: PlanStatus.ACTIVE,
    description: 'Status of the plan (e.g. ACTIVE, INACTIVE)',
  })
  @IsOptional()
  @IsEnum(PlanStatus)
  status?: PlanStatus;

     @ApiPropertyOptional({example:"true",description:"Set plan populer or not"})
    @IsBoolean()
    @IsOptional()
    is_populer: boolean

  @ApiPropertyOptional({
    type: [String],
    description:
      'Only the new features you want to add. It will be merged with existing ones.',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  features?: string[];
}
