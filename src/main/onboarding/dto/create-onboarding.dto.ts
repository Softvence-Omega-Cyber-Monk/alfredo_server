import { IsArray, IsBoolean, IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AgeRange, Gender, EmploymentStatus, TravelGroup, DestinationType, PropertyType } from '@prisma/client';

export class CreateOnboardingDto {
  @ApiProperty({
    description: 'Unique identifier of the user associated with the onboarding',
    example: 'cly0z5k3k0000v1x1y2z3a4b5',
  })
  @IsString()
  userId: string;

  // Step 1: Home Listing
  @ApiProperty({
    description: 'Address of the user’s home',
    example: '123 Main St, Springfield',
    required: false,
  })
  @IsOptional()
  @IsString()
  homeAddress?: string;

  @ApiProperty({
    description: 'Preferred travel destination',
    example: 'Paris, France',
    required: false,
  })
  @IsOptional()
  @IsString()
  destination?: string;

  // Step 2: Verification Info
  @ApiProperty({
    description: 'Age range of the user',
    enum: AgeRange,
    example: AgeRange.AGE_30_50,
    required: false,
  })
  @IsOptional()
  @IsEnum(AgeRange)
  ageRange?: AgeRange;

  @ApiProperty({
    description: 'Gender of the user',
    enum: Gender,
    example: Gender.NOT_SPECIFIED,
    required: false,
  })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiProperty({
    description: 'Employment status of the user',
    enum: EmploymentStatus,
    example: EmploymentStatus.WORKER,
    required: false,
  })
  @IsOptional()
  @IsEnum(EmploymentStatus)
  employmentStatus?: EmploymentStatus;

  @ApiProperty({
    description: 'Types of travel the user prefers',
    example: ['Adventure', 'Relaxation'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  travelType: string[];

  @ApiProperty({
    description: 'Favorite destination types',
    enum: DestinationType,
    example: [DestinationType.SEASIDE, DestinationType.BIG_CITIES],
    type: [String],
  })
  @IsArray()
  @IsEnum(DestinationType, { each: true })
  favoriteDestinations: DestinationType[];

  @ApiProperty({
    description: 'Who the user mostly travels with',
    enum: TravelGroup,
    example: TravelGroup.FAMILY,
    required: false,
  })
  @IsOptional()
  @IsEnum(TravelGroup)
  travelMostlyWith?: TravelGroup;

  @ApiProperty({
    description: 'Whether the user travels with pets',
    example: false,
  })
  @IsBoolean()
  isTravelWithPets: boolean;

  @ApiProperty({
    description: 'Additional notes about the user',
    example: 'Prefers eco-friendly accommodations',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;

  // Step 3: Property Type Info
  @ApiProperty({
    description: 'Type of property',
    enum: PropertyType,
    example: PropertyType.APARTMENT,
    required: false,
  })
  @IsOptional()
  @IsEnum(PropertyType)
  propertyType?: PropertyType;

  @ApiProperty({
    description: 'Whether the property is the main residence',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isMainResidence?: boolean;

  // Step 4: Amenities & Environment
  @ApiProperty({
    description: 'List of amenity IDs associated with the property',
    example: ['cly0z5k3k0000v1x1y2z3a4b6', 'cly0z5k3k0000v1x1y2z3a4b7'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  amenityIds: string[];

  @ApiProperty({
    description: 'List of transport option IDs available near the property',
    example: ['cly0z5k3k0000v1x1y2z3a4b8', 'cly0z5k3k0000v1x1y2z3a4b9'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  transportIds: string[];

  @ApiProperty({
    description: 'List of surrounding type IDs near the property',
    example: ['cly0z5k3k0000v1x1y2z3a4c0', 'cly0z5k3k0000v1x1y2z3a4c1'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  surroundingIds: string[];

  // Step 5: About Home
  @ApiProperty({
    description: 'Name of the home',
    example: 'Cozy Family Retreat',
    required: false,
  })
  @IsOptional()
  @IsString()
  homeName?: string;

  @ApiProperty({
    description: 'Description of the home',
    example: 'A lovely cabin near the woods with great sunlight',
    required: false,
  })
  @IsOptional()
  @IsString()
  homeDescription?: string;

  @ApiProperty({
    description: 'Description of the neighborhood',
    example: 'Quiet area with access to local parks and bakeries',
    required: false,
  })
  @IsOptional()
  @IsString()
  aboutNeighborhood?: string;

  // Step 6: Upload Photo
  @ApiProperty({
    description: 'Array of image URLs for the home',
    example: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  homeImages: string[];

  // Step 7: Home Availability
  @ApiProperty({
    description: 'Whether the home is available for exchange',
    example: true,
  })
  @IsBoolean()
  isAvailableForExchange: boolean;

  @ApiProperty({
    description: 'Start date for home availability',
    example: '2025-12-01',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  availabilityStartDate?: string;

  @ApiProperty({
    description: 'End date for home availability',
    example: '2025-12-31',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  availabilityEndDate?: string;
}

export class UpdateOnboardingDto {
  // Step 1: Home Listing
  @ApiProperty({
    description: 'Address of the user’s home',
    example: '123 Main St, Springfield',
    required: false,
  })
  @IsOptional()
  @IsString()
  homeAddress?: string;

  @ApiProperty({
    description: 'Preferred travel destination',
    example: 'Paris, France',
    required: false,
  })
  @IsOptional()
  @IsString()
  destination?: string;

  // Step 2: Verification Info
  @ApiProperty({
    description: 'Age range of the user',
    enum: AgeRange,
    example: AgeRange.AGE_30_50,
    required: false,
  })
  @IsOptional()
  @IsEnum(AgeRange)
  ageRange?: AgeRange;

  @ApiProperty({
    description: 'Gender of the user',
    enum: Gender,
    example: Gender.NOT_SPECIFIED,
    required: false,
  })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiProperty({
    description: 'Employment status of the user',
    enum: EmploymentStatus,
    example: EmploymentStatus.WORKER,
    required: false,
  })
  @IsOptional()
  @IsEnum(EmploymentStatus)
  employmentStatus?: EmploymentStatus;

  @ApiProperty({
    description: 'Types of travel the user prefers',
    example: ['Adventure', 'Relaxation'],
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  travelType?: string[];

  @ApiProperty({
    description: 'Favorite destination types',
    enum: DestinationType,
    example: [DestinationType.SEASIDE, DestinationType.BIG_CITIES],
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsEnum(DestinationType, { each: true })
  favoriteDestinations?: DestinationType[];

  @ApiProperty({
    description: 'Who the user mostly travels with',
    enum: TravelGroup,
    example: TravelGroup.FAMILY,
    required: false,
  })
  @IsOptional()
  @IsEnum(TravelGroup)
  travelMostlyWith?: TravelGroup;

  @ApiProperty({
    description: 'Whether the user travels with pets',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isTravelWithPets?: boolean;

  @ApiProperty({
    description: 'Additional notes about the user',
    example: 'Prefers eco-friendly accommodations',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;

  // Step 3: Property Type Info
  @ApiProperty({
    description: 'Type of property',
    enum: PropertyType,
    example: PropertyType.APARTMENT,
    required: false,
  })
  @IsOptional()
  @IsEnum(PropertyType)
  propertyType?: PropertyType;

  @ApiProperty({
    description: 'Whether the property is the main residence',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isMainResidence?: boolean;

  // Step 4: Amenities & Environment
  @ApiProperty({
    description: 'List of amenity IDs associated with the property',
    example: ['cly0z5k3k0000v1x1y2z3a4b6', 'cly0z5k3k0000v1x1y2z3a4b7'],
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  amenityIds?: string[];

  @ApiProperty({
    description: 'List of transport option IDs available near the property',
    example: ['cly0z5k3k0000v1x1y2z3a4b8', 'cly0z5k3k0000v1x1y2z3a4b9'],
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  transportIds?: string[];

  @ApiProperty({
    description: 'List of surrounding type IDs near the property',
    example: ['cly0z5k3k0000v1x1y2z3a4c0', 'cly0z5k3k0000v1x1y2z3a4c1'],
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  surroundingIds?: string[];

  // Step 5: About Home
  @ApiProperty({
    description: 'Name of the home',
    example: 'Cozy Family Retreat',
    required: false,
  })
  @IsOptional()
  @IsString()
  homeName?: string;

  @ApiProperty({
    description: 'Description of the home',
    example: 'A lovely cabin near the woods with great sunlight',
    required: false,
  })
  @IsOptional()
  @IsString()
  homeDescription?: string;

  @ApiProperty({
    description: 'Description of the neighborhood',
    example: 'Quiet area with access to local parks and bakeries',
    required: false,
  })
  @IsOptional()
  @IsString()
  aboutNeighborhood?: string;

  // Step 6: Upload Photo
  @ApiProperty({
    description: 'Array of image URLs for the home',
    example: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  homeImages?: string[];

  // Step 7: Home Availability
  @ApiProperty({
    description: 'Whether the home is available for exchange',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isAvailableForExchange?: boolean;

  @ApiProperty({
    description: 'Start date for home availability',
    example: '2025-12-01',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  availabilityStartDate?: string;

  @ApiProperty({
    description: 'End date for home availability',
    example: '2025-12-31',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  availabilityEndDate?: string;
}