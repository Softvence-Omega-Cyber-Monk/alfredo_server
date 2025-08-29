import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class UpdateUserRoleDto {
  @ApiProperty({ example: 'ADMIN', description: 'New role of the user' })
  @IsString()
  @IsNotEmpty()
  role: string;
}
