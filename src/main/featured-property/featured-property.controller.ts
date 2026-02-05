import {
    Controller,
    Get,
    Post,
    Delete,
    Patch,
    Body,
    Param,
    UseGuards,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { FeaturedPropertyService } from './featured-property.service';
import { CreateFeaturedPropertyDto, UpdateFeaturedOrderDto } from './dto/featured-property.dto';
import {
    ApiTags,
    ApiOperation,
    ApiBody,
    ApiParam,
    ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Featured Property')
@Controller('featured-property')
export class FeaturedPropertyController {
    constructor(private readonly featuredPropertyService: FeaturedPropertyService) { }

    /**
     * GET - Public endpoint for landing page
     */
    @Get()
    @ApiOperation({ summary: 'Get all featured properties (for landing page)' })
    async getFeaturedProperties() {
        try {
            const data = await this.featuredPropertyService.getFeaturedProperties();
            return {
                success: true,
                message: 'Featured properties fetched successfully',
                data,
            };
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * GET - Admin endpoint with full details
     */
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get('admin')
    @ApiOperation({ summary: 'Get all featured properties with details (admin)' })
    async getAllFeaturedForAdmin() {
        try {
            const result = await this.featuredPropertyService.getAllFeaturedForAdmin();
            return {
                success: true,
                message: 'Featured properties fetched successfully',
                ...result,
            };
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * POST - Add property to featured list (Admin only)
     */
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Post()
    @ApiOperation({ summary: 'Add a property to featured list (admin)' })
    @ApiBody({ type: CreateFeaturedPropertyDto })
    async addFeaturedProperty(@Body() dto: CreateFeaturedPropertyDto) {
        try {
            const data = await this.featuredPropertyService.addFeaturedProperty(dto);
            return {
                success: true,
                message: 'Property added to featured list successfully',
                data,
            };
        } catch (error) {
            if (error.status) {
                throw error;
            }
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * DELETE - Remove property from featured list (Admin only)
     */
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Delete(':propertyId')
    @ApiOperation({ summary: 'Remove a property from featured list (admin)' })
    @ApiParam({ name: 'propertyId', description: 'Property ID to remove from featured' })
    async removeFeaturedProperty(@Param('propertyId') propertyId: string) {
        try {
            const result = await this.featuredPropertyService.removeFeaturedProperty(propertyId);
            return {
                success: true,
                ...result,
            };
        } catch (error) {
            if (error.status) {
                throw error;
            }
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * PATCH - Update display order of featured property (Admin only)
     */
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Patch(':propertyId/order')
    @ApiOperation({ summary: 'Update display order of featured property (admin)' })
    @ApiParam({ name: 'propertyId', description: 'Property ID to update order' })
    @ApiBody({ type: UpdateFeaturedOrderDto })
    async updateOrder(
        @Param('propertyId') propertyId: string,
        @Body() dto: UpdateFeaturedOrderDto,
    ) {
        try {
            const data = await this.featuredPropertyService.updateOrder(propertyId, dto);
            return {
                success: true,
                message: 'Featured property order updated successfully',
                data,
            };
        } catch (error) {
            if (error.status) {
                throw error;
            }
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
