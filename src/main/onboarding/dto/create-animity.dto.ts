// create-amenity.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CreateAmenityDto {
  @ApiProperty({
    description: 'Name of the amenity',
    example: 'Swimming Pool',
  })
  @IsString()
  @IsOptional()
  name?: string;
  
  @ApiProperty({
    description: "Greek name",
    example: "Παιδική χαρά"
  })
  @IsString()
  @IsOptional()
  greek_name?: string;

  @ApiProperty({
    description: 'Icon file for the amenity',
    type: 'string',
    format: 'binary',
    required: false,
  })
  @IsOptional()
  icon?: any;
}
