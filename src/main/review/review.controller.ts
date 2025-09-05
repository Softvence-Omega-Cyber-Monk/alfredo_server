import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  HttpException,
  HttpStatus,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from 'src/common/decorators/user.decorator';
import { ReviewService } from './review.service';
import { Request } from 'express';

@ApiTags('Review')
@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  /** CREATE REVIEW */
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':propertyId')
  @ApiOperation({ summary: 'Create a review for a property' })
  @ApiParam({ name: 'propertyId', description: 'ID of the property to review' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        rating: {
          type: 'number',
          minimum: 1,
          maximum: 5,
          description: 'Rating between 1 and 5',
        },
        comment: { type: 'string', description: 'Optional review comment' },
      },
      required: ['rating'],
      example: {
        rating: 5,
        comment: 'Amazing place, very clean and comfortable!',
      },
    },
  })
  async createReview(
    @User() user: any,
    @Param('propertyId') propertyId: string,
    @Body() body: { rating: number; comment?: string },
  ) {
    try {
      return await this.reviewService.createReview(user.id, propertyId, body);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  /** GET REVIEWS BY PROPERTY */
  @Get('property/:propertyId')
  @ApiOperation({ summary: 'Get all reviews for a property' })
  @ApiParam({ name: 'propertyId', description: 'ID of the property' })
  async getReviewsByProperty(@Param('propertyId') propertyId: string) {
    return this.reviewService.getReviewsByProperty(propertyId);
  }

  /** GET REVIEWS BY USER */
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('my-reviews')
  @ApiOperation({ summary: 'Get all reviews written by a user' })
  async getReviewsByUser(@User() user: any, @Req() req: Request) {
    return this.reviewService.getReviewsByUser(user.id);
  }

  /** DELETE REVIEW */
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':reviewId')
  @ApiOperation({ summary: 'Delete a review (only by the author)' })
  @ApiParam({ name: 'reviewId', description: 'ID of the review to delete' })
  async deleteReview(@User() user: any, @Param('reviewId') reviewId: string) {
    try {
      return await this.reviewService.deleteReview(user.id, reviewId);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}
