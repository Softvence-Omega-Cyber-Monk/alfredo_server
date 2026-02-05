import {
    Injectable,
    NotFoundException,
    ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFeaturedPropertyDto, UpdateFeaturedOrderDto } from './dto/featured-property.dto';

@Injectable()
export class FeaturedPropertyService {
    constructor(private prisma: PrismaService) { }

    /**
     * Add a property to featured list
     */
    async addFeaturedProperty(dto: CreateFeaturedPropertyDto) {
        // Check if property exists and is not deleted
        const property = await this.prisma.property.findFirst({
            where: { id: dto.propertyId, isDeleted: false },
        });

        if (!property) {
            throw new NotFoundException(`Property with ID ${dto.propertyId} not found`);
        }

        // Check if already featured
        const existingFeatured = await this.prisma.featuredProperty.findUnique({
            where: { propertyId: dto.propertyId },
        });

        if (existingFeatured) {
            throw new ConflictException('Property is already in featured list');
        }

        // Get the next order value if not provided
        let order = dto.order;
        if (order === undefined) {
            const maxOrder = await this.prisma.featuredProperty.aggregate({
                _max: { order: true },
            });
            order = (maxOrder._max.order ?? -1) + 1;
        }

        return this.prisma.featuredProperty.create({
            data: {
                propertyId: dto.propertyId,
                order,
            },
            include: {
                property: {
                    include: {
                        owner: true,
                        amenities: true,
                        transports: true,
                        surroundings: true,
                    },
                },
            },
        });
    }

    /**
     * Remove a property from featured list
     */
    async removeFeaturedProperty(propertyId: string) {
        const existingFeatured = await this.prisma.featuredProperty.findUnique({
            where: { propertyId },
        });

        if (!existingFeatured) {
            throw new NotFoundException('Property is not in featured list');
        }

        await this.prisma.featuredProperty.delete({
            where: { propertyId },
        });

        return { message: 'Property removed from featured list successfully' };
    }

    /**
     * Get all featured properties for landing page (public endpoint)
     */
    async getFeaturedProperties() {
        return this.prisma.featuredProperty.findMany({
            orderBy: { order: 'asc' },
            include: {
                property: {
                    include: {
                        owner: true,
                        amenities: true,
                        transports: true,
                        surroundings: true,
                    },
                },
            },
        });
    }

    /**
     * Get all featured properties with details (admin endpoint)
     */
    async getAllFeaturedForAdmin() {
        const featured = await this.prisma.featuredProperty.findMany({
            orderBy: { order: 'asc' },
            include: {
                property: {
                    include: {
                        owner: true,
                        amenities: true,
                        transports: true,
                        surroundings: true,
                    },
                },
            },
        });

        return {
            data: featured,
            total: featured.length,
        };
    }

    /**
     * Update display order of a featured property
     */
    async updateOrder(propertyId: string, dto: UpdateFeaturedOrderDto) {
        const existingFeatured = await this.prisma.featuredProperty.findUnique({
            where: { propertyId },
        });

        if (!existingFeatured) {
            throw new NotFoundException('Property is not in featured list');
        }

        return this.prisma.featuredProperty.update({
            where: { propertyId },
            data: { order: dto.order },
            include: {
                property: {
                    include: {
                        owner: true,
                        amenities: true,
                        transports: true,
                        surroundings: true,
                    },
                },
            },
        });
    }
}
