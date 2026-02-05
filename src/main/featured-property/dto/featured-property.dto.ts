import { IsNotEmpty, IsString, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFeaturedPropertyDto {
    @ApiProperty({
        description: 'The ID of the property to add to featured list',
        example: '1b4b8754-62a9-439c-a11b-2e0ce16716ad',
    })
    @IsNotEmpty()
    @IsString()
    propertyId: string;

    @ApiProperty({
        description: 'Display order for the featured property (lower = higher priority)',
        example: 0,
        required: false,
    })
    @IsOptional()
    @IsNumber()
    order?: number;
}

export class UpdateFeaturedOrderDto {
    @ApiProperty({
        description: 'New display order for the featured property',
        example: 1,
    })
    @IsNotEmpty()
    @IsNumber()
    order: number;
}
