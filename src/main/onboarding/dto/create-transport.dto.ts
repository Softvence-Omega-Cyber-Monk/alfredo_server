// create-transport.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CreateTransportDto {
  @ApiProperty({
    description: 'Name of the transport option',
    example: 'Bus Station',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'Greek Name of the transport option',
    example: 'Στάση λεωφορείου',
  })
  @IsString()
  @IsOptional()
  greek_name?: string;
  
  @ApiProperty({
    description: 'Icon file for the transport option',
    type: 'string',
    format: 'binary',
    required: false,
  })
  @IsOptional()
  icon?: any;
}
