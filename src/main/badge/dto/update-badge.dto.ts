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
  greek_displayName?: string;

  @IsOptional()
  @IsString()
  badge_type?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  greek_discription?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsString()
  iconPublicId?: string;
}
