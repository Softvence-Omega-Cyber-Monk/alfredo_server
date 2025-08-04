import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOnboardingDto } from './dto/create-onboarding.dto';
import { UpdateOnboardingDto } from './dto/update-onboarding.dto';


@Injectable()
export class OnboardingService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateOnboardingDto) {
    return this.prisma.onboarding.create({ data: dto });
  }

  async findByUserId(userId: string) {
    const onboarding = await this.prisma.onboarding.findUnique({
      where: { userId },
      include: {
        onboardedAmenities: true,
        onboardedTransports: true,
        onboardedSurroundings: true,
        favoriteDestinations: true,
      },
    });

    if (!onboarding) throw new NotFoundException('Onboarding not found');
    return onboarding;
  }

  async update(userId: string, dto: UpdateOnboardingDto) {
    return this.prisma.onboarding.update({
      where: { userId },
      data: dto,
    });
  }

  async delete(userId: string) {
    return this.prisma.onboarding.delete({ where: { userId } });
  }
}
