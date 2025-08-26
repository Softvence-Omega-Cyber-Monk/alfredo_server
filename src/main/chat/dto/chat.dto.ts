import { ApiProperty } from '@nestjs/swagger';

export class MessageDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  senderId: string;

  @ApiProperty()
  receiverId: string;

  @ApiProperty()
  content: string;

  @ApiProperty({ required: false })
  exchangeRequestId?: string;

  @ApiProperty()
  createdAt: Date;
}
