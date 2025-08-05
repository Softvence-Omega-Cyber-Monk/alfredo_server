import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  AgeRange,
  EmploymentStatus,
  Gender,
  PropertyType,
  TravelGroup,
  DestinationType
} from '@prisma/client';

class FavoriteDestinationDto {
  @IsEnum(DestinationType)
  type: DestinationType;
}

export class CreateOnboardingDto {
  // Step 1
  @IsOptional()
  @IsString()
  homeAddress?: string;

  @IsOptional()
  @IsString()
  destination?: string;

  // Step 2
  @IsOptional()
  @IsEnum(AgeRange)
  ageRange?: AgeRange;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsEnum(EmploymentStatus)
  employmentStatus?: EmploymentStatus;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  travelType?: string[];

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => FavoriteDestinationDto)
  favoriteDestinations?: FavoriteDestinationDto[];

  @IsOptional()
  @IsEnum(TravelGroup)
  travelMostlyWith?: TravelGroup;

  @IsOptional()
  @IsBoolean()
  isTravelWithPets?: boolean;

  @IsOptional()
  @IsString()
  notes?: string;

  // Step 3
  @IsOptional()
  @IsEnum(PropertyType)
  propertyType?: PropertyType;

  @IsOptional()
  @IsBoolean()
  isMainResidence?: boolean;

  // Step 4
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  onboardedAmenities?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  onboardedTransports?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  onboardedSurroundings?: string[];

  // Step 5
  @IsOptional()
  @IsString()
  homeName?: string;

  @IsOptional()
  @IsString()
  homeDescription?: string;

  @IsOptional()
  @IsString()
  aboutNeighborhood?: string;

  // Step 6 – Images will come from `req.files`

  // Step 7
  @IsOptional()
  @IsBoolean()
  isAvailableForExchange?: boolean;

  @IsOptional()
  @IsDateString()
  availabilityStartDate?: string;

  @IsOptional()
  @IsDateString()
  availabilityEndDate?: string;
}
