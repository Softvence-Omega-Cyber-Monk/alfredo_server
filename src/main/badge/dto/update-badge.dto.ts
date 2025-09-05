import { IsOptional, IsEnum, IsString } from 'class-validator';
import { BadgeType } from '@prisma/client';

export class UpdateBadgeDto {
  @IsOptional()
  @IsEnum(BadgeType)
  type?: BadgeType;

  @IsOptional()
  @IsString()
  displayName?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsString()
  iconPublicId?: string;
}
