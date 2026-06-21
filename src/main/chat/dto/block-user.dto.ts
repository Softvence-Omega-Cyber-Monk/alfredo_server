import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class BlockUserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  blockerId: string;

  @ApiProperty()
  blockedId: string;

  @ApiProperty()
  createdAt: Date;
}

export class BlockedUserListItemDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  blockedId: string;

  @ApiProperty()
  fullName: string;

  @ApiProperty({ required: false })
  photo?: string;

  @ApiProperty()
  createdAt: Date;
}
