import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean, IsArray, IsEnum, IsDateString, IsNumber } from 'class-validator';
import { IdentificationType, Language, PropertyType, TravelGroup } from '@prisma/client';

export class UpdateUserDto {
  // ===== User fields =====
  @ApiPropertyOptional({ description: 'Full name of the user' })
  @IsOptional() @IsString() fullName?: string;

  @ApiPropertyOptional({ description: 'Email of the user' })
  @IsOptional() @IsString() email?: string;

  @ApiPropertyOptional({ description: 'Phone number of the user' })
  @IsOptional() @IsString() phoneNumber?: string;

  @ApiPropertyOptional({ description: 'City of the user' })
  @IsOptional() @IsString() city?: string;

  @ApiPropertyOptional({ description: 'Age of the user' })
  @IsOptional() @IsString() age?: string;

  @ApiPropertyOptional({ description: 'Date of birth (ISO string)' })
  @IsOptional() @IsDateString() dateOfBirth?: string;

  @ApiPropertyOptional({ description: 'Identification type', enum: IdentificationType })
  @IsOptional() @IsEnum(IdentificationType) identification?: IdentificationType;

  @ApiPropertyOptional({ description: 'Language preference', enum: Language })
  @IsOptional() @IsEnum(Language) languagePreference?: Language;

  @ApiPropertyOptional({ description: 'Is subscribed?' })
  @IsOptional() @IsBoolean() isSubscribed?: boolean;

  // ===== Onboarding fields =====
  @ApiPropertyOptional({ description: 'Home address' })
  @IsOptional() @IsString() homeAddress?: string;

  @ApiPropertyOptional({ description: 'Travel types', type: [String] })
  @IsOptional() @IsArray() travelType?: string[];

  @ApiPropertyOptional({ description: 'Favorite destinations', type: [String] })
  @IsOptional() @IsArray() favoriteDestinations?: string[];

  @ApiPropertyOptional({ description: 'Traveling with pets?' })
  @IsOptional() @IsBoolean() isTravelWithPets?: boolean;

  @ApiPropertyOptional({ description: 'Notes about onboarding' })
  @IsOptional() @IsString() notes?: string;

  @ApiPropertyOptional({ description: 'Home description' })
  @IsOptional() @IsString() homeDescription?: string;

  @ApiPropertyOptional({ description: 'About neighborhood' })
  @IsOptional() @IsString() aboutNeighborhood?: string;

  @ApiPropertyOptional({ description: 'Is available for exchange?' })
  @IsOptional() @IsBoolean() isAvailableForExchange?: boolean;

  @ApiPropertyOptional({ description: 'Availability start date', type: String, format: 'date-time' })
  @IsOptional() @IsDateString() availabilityStartDate?: Date;

  @ApiPropertyOptional({ description: 'Availability end date', type: String, format: 'date-time' })
  @IsOptional() @IsDateString() availabilityEndDate?: Date;

  @ApiPropertyOptional({ description: 'Maximum people' })
  @IsOptional() @IsNumber() maxPeople?: number;

  @ApiPropertyOptional({ description: 'Property type', enum: PropertyType })
  @IsOptional() propertyType?: PropertyType;

   @ApiPropertyOptional({ description: 'Property type', enum: PropertyType })
  @IsOptional() travelMostlyWith?: TravelGroup;

  @ApiPropertyOptional({ description: 'Is main residence?' })
  @IsOptional() @IsBoolean() isMainResidence?: boolean;

  @ApiPropertyOptional({ description: 'Home name' })
  @IsOptional() @IsString() homeName?: string;
}
