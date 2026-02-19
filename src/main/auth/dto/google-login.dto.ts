import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GoogleLoginDto {
    @ApiProperty({ description: 'Firebase ID token from Google sign-in' })
    @IsString()
    @IsNotEmpty()
    idToken: string;
}
