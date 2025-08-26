// create-exchange-request.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class CreateExchangeRequestDto {
  @ApiProperty({ description: 'ID of the user sending the request' })
  fromUserId: string;

  @ApiProperty({ description: 'ID of the user receiving the request' })
  toUserId: string;

  @ApiProperty({ description: 'ID of the property offered by the sender' })
  fromPropertyId: string;

  @ApiProperty({
    description: 'ID of the property requested from the receiver',
  })
  toPropertyId: string;

  @ApiProperty({ description: 'Optional message' })
  message?: string;
}
