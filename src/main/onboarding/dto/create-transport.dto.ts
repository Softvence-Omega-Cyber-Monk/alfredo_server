// create-transport.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CreateTransportDto {
  @ApiProperty({
    description: 'Name of the transport option',
    example: 'Bus Station',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Icon file for the transport option',
    type: 'string',
    format: 'binary',
    required: false,
  })
  @IsOptional()
  icon?: Express.Multer.File;
}
