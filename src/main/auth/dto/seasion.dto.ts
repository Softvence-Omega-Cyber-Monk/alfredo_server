import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class SeasionDTO {
  @ApiProperty({
    example: 'rahmanaq777@gmail.com',
    description: 'Registered user email',
  })
  @IsEmail()
  email: string;

}
