import { ApiProperty } from '@nestjs/swagger';

export class UploadAttachmentResponseDto {
  @ApiProperty()
  url: string;

  @ApiProperty()
  type: string; // "image" | "file"

  @ApiProperty()
  name: string;

  @ApiProperty()
  size: number;
}
