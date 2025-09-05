import { ApiPropertyOptional } from '@nestjs/swagger';
import { IdentificationType, Language } from '@prisma/client';
import {
  IsArray,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';
import { Express } from 'express';

export class UpdateUserDto {
  @ApiPropertyOptional({
    example: 'John Doe',
    description: 'Full name of the user',
  })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional({
    example: 'john@example.com',
    description: 'Email address',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '1234567890', description: 'Phone number' })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  // File upload field
  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Profile photo file',
  })
  @IsOptional()
  photo?: Express.Multer.File;

  @ApiPropertyOptional({ example: '25', description: 'Age of the user' })
  @IsOptional()
  @IsString()
  age?: string;

  @ApiPropertyOptional({ example: '1998-05-20', description: 'Date of birth' })
  @IsOptional()
  @IsString()
  dateOfBirth?: string;

  @ApiPropertyOptional({
    enum: IdentificationType,
    description: 'Type of identification',
  })
  @IsOptional()
  @IsEnum(IdentificationType)
  identification?: IdentificationType;

  @ApiPropertyOptional({ enum: Language, description: 'Preferred language' })
  @IsOptional()
  @IsEnum(Language)
  languagePreference?: Language;

  @ApiPropertyOptional({ type: [String], description: 'List of cities' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  city?: string[];

  @ApiPropertyOptional({ type: [String], description: 'Achievement badges' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  achievementBadges?: string[];

  @ApiPropertyOptional({ type: [String], description: 'Payment card numbers' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  paymentCardNumber?: string[];
}
