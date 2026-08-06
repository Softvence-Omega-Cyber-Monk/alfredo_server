import { Module } from '@nestjs/common';
import { OnboardingService } from './onboarding.service';
import { OnboardingController } from './onboarding.controller';
import { PrismaService } from '../prisma/prisma.service';
import { BadgeService } from '../badge/badge.service';
import { StorageService } from 'src/common/services/storage.service';

@Module({
  controllers: [OnboardingController],
  providers: [OnboardingService, PrismaService,BadgeService, StorageService],
})
export class OnboardingModule {}
