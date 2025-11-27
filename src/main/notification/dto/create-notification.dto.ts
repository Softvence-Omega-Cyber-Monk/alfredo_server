import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateNotificationDto {
  @ApiProperty()
  @IsString()
  userId: string;

  @ApiProperty({ required: false })
  title: string;

  @ApiProperty({ required: false })
  message: string;
}
