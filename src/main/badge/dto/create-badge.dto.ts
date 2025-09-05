import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { BadgeType } from '@prisma/client';
export class CreateBadgeDto {
  @IsEnum(BadgeType)
  type: BadgeType;

  @IsString()
  @IsNotEmpty()
  displayName: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  icon?: string; // will be set after upload
  @IsString()
  @IsOptional()
  iconPublicId?: string; // set after upload
}
