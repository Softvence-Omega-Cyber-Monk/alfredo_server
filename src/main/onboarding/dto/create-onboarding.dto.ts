import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean, IsArray, IsEnum, IsDateString } from 'class-validator';
import { AgeRange, Gender, EmploymentStatus, TravelGroup, PropertyType } from '@prisma/client';

export class CreateOnboardingDto {
  @ApiProperty() userId: string;

  // Step 1
  @ApiProperty({ required: false }) @IsOptional() @IsString() homeAddress?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() destination?: string;

  // Step 2
  @ApiProperty({ enum: AgeRange, required: false }) @IsOptional() ageRange?: AgeRange;
  @ApiProperty({ enum: Gender, required: false }) @IsOptional() gender?: Gender;
  @ApiProperty({ enum: EmploymentStatus, required: false }) @IsOptional() employmentStatus?: EmploymentStatus;
  @ApiProperty({ required: false, isArray: true }) @IsOptional() @IsArray() travelType?: string[];
  @ApiProperty({ enum: TravelGroup, required: false }) @IsOptional() travelMostlyWith?: TravelGroup;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() isTravelWithPets?: boolean;
  @ApiProperty({ required: false }) @IsOptional() @IsString() notes?: string;

  // Step 3
  @ApiProperty({ enum: PropertyType, required: false }) @IsOptional() propertyType?: PropertyType;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() isMainResidence?: boolean;

  // Step 4
  @ApiProperty({ type: [String], required: false }) @IsOptional() onboardedAmenities?: string[];
  @ApiProperty({ type: [String], required: false }) @IsOptional() onboardedTransports?: string[];
  @ApiProperty({ type: [String], required: false }) @IsOptional() onboardedSurroundings?: string[];

  // Step 5
  @ApiProperty({ required: false }) @IsOptional() @IsString() homeName?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() homeDescription?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() aboutNeighborhood?: string;

  // Step 6
  @ApiProperty({ required: false, type: [String] }) @IsOptional() homeImages?: string[];

  // Step 7
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() isAvailableForExchange?: boolean;
  @ApiProperty({ required: false }) @IsOptional() @IsDateString() availabilityStartDate?: Date;
  @ApiProperty({ required: false }) @IsOptional() @IsDateString() availabilityEndDate?: Date;
}
