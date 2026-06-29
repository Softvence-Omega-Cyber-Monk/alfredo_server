// create-exchange-request.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsString, IsOptional } from 'class-validator';

export class CreateExchangeRequestDto {
  @ApiProperty({ description: 'ID of the user sending the request' })
  @IsUUID()
  fromUserId: string;

  @ApiProperty({ description: 'ID of the user receiving the request' })
  @IsUUID()
  toUserId: string;

  @ApiProperty({ description: 'ID of the property offered by the sender' })
  @IsUUID()
  fromPropertyId: string;

  @ApiProperty({
    description: 'ID of the property requested from the receiver',
  })
  @IsUUID()
  toPropertyId: string;

  @ApiProperty({ description: 'Optional message' })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiProperty({ description: 'Exchange start date' })
  @IsOptional()
  exchangeStartDate?: Date;

  @ApiProperty({ description: 'Exchange end date' })
  @IsOptional()
  exchangeEndDate?: Date;
}
