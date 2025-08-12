import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  AgeRange,
  EmploymentStatus,
  Gender,
  PropertyType,
  TravelGroup,
  DestinationType,
} from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class FavoriteDestinationDto {
  @ApiProperty({ enum: DestinationType })
  @IsEnum(DestinationType)
  type: DestinationType;
}

export class CreateOnboardingDto {
  // Step 1
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  homeAddress?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  destination?: string;

  // Step 2
  @ApiPropertyOptional({ enum: AgeRange })
  @IsOptional()
  @IsEnum(AgeRange)
  ageRange?: AgeRange;

  @ApiPropertyOptional({ enum: Gender })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiPropertyOptional({ enum: EmploymentStatus })
  @IsOptional()
  @IsEnum(EmploymentStatus)
  employmentStatus?: EmploymentStatus;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  travelType?: string[];

  @ApiPropertyOptional({ type: [FavoriteDestinationDto] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true }) // ensures each item in the array is a string
  @Type(() => String) // ensures incoming data is cast to string array
  favoriteDestinations?: string[];

  @ApiPropertyOptional({ enum: TravelGroup })
  @IsOptional()
  @IsEnum(TravelGroup)
  travelMostlyWith?: TravelGroup;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isTravelWithPets?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  // Step 3
  @ApiPropertyOptional({ enum: PropertyType })
  @IsOptional()
  @IsEnum(PropertyType)
  propertyType?: PropertyType;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isMainResidence?: boolean;

  // Step 4
  @ApiPropertyOptional({ type: [String], description: 'Amenity IDs' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  onboardedAmenities?: string[];

  @ApiPropertyOptional({ type: [String], description: 'Transport Option IDs' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  onboardedTransports?: string[];

  @ApiPropertyOptional({ type: [String], description: 'Surrounding Type IDs' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  onboardedSurroundings?: string[];

  // Step 5
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  homeName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  homeDescription?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  aboutNeighborhood?: string;

  // Step 6 – Images via req.files

  // Step 7
  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isAvailableForExchange?: boolean;

  @ApiPropertyOptional({ type: String, format: 'date-time' })
  @IsOptional()
  @IsDateString()
  availabilityStartDate?: string;

  @ApiPropertyOptional({ type: String, format: 'date-time' })
  @IsOptional()
  @IsDateString()
  availabilityEndDate?: string;
}
