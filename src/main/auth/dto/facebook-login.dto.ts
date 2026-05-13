import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FacebookLoginDto {
    @ApiProperty({ description: 'Firebase ID token from Facebook sign-in' })
    @IsString()
    @IsNotEmpty()
    idToken: string;
}
