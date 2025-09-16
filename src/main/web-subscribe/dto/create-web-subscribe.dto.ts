import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class CreateWebSubscribeDto {
    @ApiProperty({
        example: 'John@gmail.com',
        description: 'provide your email',
    })
   @IsString()
    email: string;
}
