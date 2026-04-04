// create-surrounding.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CreateSurroundingDto {
  @ApiProperty({
    description: 'Name of the surrounding',
    example: 'Park',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'Greek Name of the surrounding',
    example: 'Πάρκο',
  })
  @IsString()
  @IsOptional()
  greek_name?: string;

  @ApiProperty({
    description: 'Icon file for the surrounding',
    type: 'string',
    format: 'binary',
    required: false,
  })
  @IsOptional()
  icon?: any;
}
