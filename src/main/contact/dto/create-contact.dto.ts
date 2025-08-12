import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateContactDto {
  @ApiProperty({
    example: 'John Doe',
    description: 'Full name of the person submitting the contact form',
  })
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Email address of the person',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: '+8801601146777',
    description: 'Phone number of the person',
  })
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @ApiProperty({
    example: 'I really love your platform!',
    description: 'Message or opinion from the user',
  })
  @IsNotEmpty()
  opinion: string;
}
