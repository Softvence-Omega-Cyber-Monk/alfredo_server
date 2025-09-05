import { Module } from '@nestjs/common';
import { ReviewService } from './review.service';
import { ReviewController } from './review.controller';
import { BadgeModule } from '../badge/badge.module';

@Module({
imports: [BadgeModule],
  controllers: [ReviewController],
  providers: [ReviewService],
})
export class ReviewModule {}
