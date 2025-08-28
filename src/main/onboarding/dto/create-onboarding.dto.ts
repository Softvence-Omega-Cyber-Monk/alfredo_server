import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  AgeRange,
  EmploymentStatus,
  Gender,
  PropertyType,
  TravelGroup,
  DestinationType,
} from '@prisma/client';
import { Transform } from 'class-transformer';

export class CreateOnboardingDto {
  // Step 1: Home Listing
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  homeAddress?: string;

  maxPeople?: number;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  destination?: string;

  // Step 2: Verification Info
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

  @ApiPropertyOptional({
    type: [String],
    description: 'Travel types (will be stored as CSV)',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  travelType?: string[];

  @ApiPropertyOptional({
    type: [String],
    enum: DestinationType,
    description: 'Favorite destinations',
  })
  @IsOptional()
  @IsArray()
  @IsEnum(DestinationType, { each: true })
  favoriteDestinations?: DestinationType[];

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

  // Step 3: Property Type Info
  @ApiPropertyOptional({ enum: PropertyType })
  @IsOptional()
  @IsEnum(PropertyType)
  propertyType?: PropertyType;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isMainResidence?: boolean;

  // Step 4: Amenities, Transports & Surroundings (as codes)
  @ApiPropertyOptional({ type: [String], description: 'Amenity codes' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.split(',').map((v) => v.trim()) : value,
  )
  onboardedAmenities?: string[];

  @ApiPropertyOptional({
    type: [String],
    description: 'Transport option codes',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.split(',').map((v) => v.trim()) : value,
  )
  onboardedTransports?: string[];

  @ApiPropertyOptional({
    type: [String],
    description: 'Surrounding type codes',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.split(',').map((v) => v.trim()) : value,
  )
  onboardedSurroundings?: string[];

  // Step 5: About Home
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

  // Step 6: Home images uploaded via req.files
  // (No DTO field needed; handled in the service as files[])

  // Step 7: Home Availability
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
