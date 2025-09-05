import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BadgeService } from '../badge/badge.service';
import { BadgeType } from '@prisma/client';

@Injectable()
export class ReviewService {
  constructor(private prisma: PrismaService,private badgeService: BadgeService) {}

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

    const result=await  this.prisma.review.create({
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

     await this.updatePropertyRating(propertyId);
     await this.checkReviewBadge(property.ownerId);

     return result
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

   const result=await this.prisma.review.delete({ where: { id: reviewId } });

   await this.updatePropertyRating(review.propertyId)

   return result
  }



private async updatePropertyRating(propertyId: string) {
  const result = await this.prisma.review.aggregate({
    _avg: { rating: true },
    _count: { rating: true },
    where: { propertyId },
  });

  await this.prisma.property.update({
    where: { id: propertyId },
    data: {
      averageRating: result._avg.rating ?? 0,
      reviewCount: result._count.rating,
    },
  });
}

private async checkReviewBadge(userId: string) {
    // Count total reviews on all properties of this user
    const userProperties = await this.prisma.property.findMany({ where: { ownerId: userId } });
    const propertyIds = userProperties.map(p => p.id);

    if (propertyIds.length === 0) return;

    const reviewCount = await this.prisma.review.count({
      where: { propertyId: { in: propertyIds } },
    });

    // If review count >= 100, award badge
    if (reviewCount >= 100) {
      await this.badgeService.awardBadgeToUser(userId, BadgeType.REVIEW_BADGE);
    }
  }

}
