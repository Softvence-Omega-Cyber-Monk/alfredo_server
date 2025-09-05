import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReviewService {
  constructor(private prisma: PrismaService) {}

  async createReview(
    userId: string,
    propertyId: string,
    data: { rating: number; comment?: string },
  ) {
    // ✅ Ensure rating is between 1 and 5
    if (data.rating < 1 || data.rating > 5) {
      throw new BadRequestException('Rating must be between 1 and 5');
    }

    // ✅ Ensure property exists
    const property = await this.prisma.property.findUnique({
      where: { id: propertyId },
    });
    if (!property)
      throw new NotFoundException(`Property with ID ${propertyId} not found`);

    if (userId === property.ownerId) {
      throw new BadRequestException('You can not review your own property');
    }

    return this.prisma.review.create({
      data: {
        rating: data.rating,
        comment: data.comment,
        userId,
        propertyId,
      },
      include: {
        user: true,
        property: true,
      },
    });
  }

  async getReviewsByProperty(propertyId: string) {
    return this.prisma.review.findMany({
      where: { propertyId },
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getReviewsByUser(userId: string) {
    return this.prisma.review.findMany({
      where: { userId },
      include: { property: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async deleteReview(userId: string, reviewId: string) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
    });
    if (!review)
      throw new NotFoundException(`Review with ID ${reviewId} not found`);

    if (review.userId !== userId) {
      throw new ForbiddenException('You can only delete your own reviews');
    }

    return this.prisma.review.delete({ where: { id: reviewId } });
  }
}
