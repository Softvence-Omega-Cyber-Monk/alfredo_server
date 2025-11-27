import { ApiProperty } from "@nestjs/swagger";
import { BadgeType } from "@prisma/client";
import { IsEnum } from "class-validator";

export class GiveBadgeDto {
  @ApiProperty({
    description: 'The type of badge to give',
    enum: BadgeType,
    example: BadgeType.PHILOXENIA,
  })
  @IsEnum(BadgeType)
  badgetype: BadgeType;
}
