import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsString,
  IsUUID,
  Length,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    example: 'Rahman',
    description: 'First name of the user',
  })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({
    example: 'Abdul Quadir',
    description: 'Last name of the user',
  })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({
    example: 'rahmanaq777@gmail.com',
    description: 'User email address',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'rahman123',
    description: 'Password (min 6 characters)',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  password: string;
}

export class SendOtpDto {
  @ApiProperty()
  @IsUUID()
  userId: string;

  @ApiProperty({ enum: ['email', 'phone'] })
  @IsIn(['email', 'phone'])
  method: 'email' | 'phone';
}

export class VerifyOtpDto {
  @ApiProperty()
  @IsUUID()
  userId: string;

  @ApiProperty()
  @Length(4, 4)
  otp: string;
}
