import { Module } from '@nestjs/common';
import { OnboardingService } from './onboarding.service';
import { OnboardingController } from './onboarding.controller';
import { PrismaService } from '../prisma/prisma.service';
import { BadgeService } from '../badge/badge.service';

@Module({
  controllers: [OnboardingController],
  providers: [OnboardingService, PrismaService,BadgeService],
})
export class OnboardingModule {}
