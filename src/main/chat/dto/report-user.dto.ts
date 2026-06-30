import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ReportUserDto {
  @ApiProperty({
    description: 'The reason for reporting the user',
    example: 'Spam',
  })
  @IsNotEmpty()
  @IsString()
  reason: string;

  @ApiPropertyOptional({
    description: 'Additional details about the report',
    example: 'Sending too many promotional links',
  })
  @IsOptional()
  @IsString()
  details?: string;
}
