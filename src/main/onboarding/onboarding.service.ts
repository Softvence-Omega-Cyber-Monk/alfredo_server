// src/onboarding/onboarding.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

import { CreateOnboardingDto } from './dto/create-onboarding.dto';
import { Prisma } from '@prisma/client';
import { CloudinaryService } from 'src/common/services/cloudinary.service';

@Injectable()
export class OnboardingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  async create(userId: string, dto: CreateOnboardingDto, homeImages: Express.Multer.File[]) {
    const imageUrls: string[] = [];

    if (homeImages?.length) {
      for (const file of homeImages) {
        const uploaded = await this.cloudinary.uploadImage(file);
        imageUrls.push(uploaded.secure_url);
      }
    }

    // Handle nested relations like favoriteDestinations
    const favoriteDestinations: Prisma.FavoriteDestinationCreateWithoutOnboardingInput[] =
      dto.favoriteDestinations?.map((fd) => ({
        type: fd.type,
      })) || [];

    const onboarding = await this.prisma.onboarding.create({
      data: {
        userId,
        homeAddress: dto.homeAddress,
        destination: dto.destination,
        ageRange: dto.ageRange,
        gender: dto.gender,
        employmentStatus: dto.employmentStatus,
        travelType: dto.travelType,
        travelMostlyWith: dto.travelMostlyWith,
        isTravelWithPets: dto.isTravelWithPets ?? false,
        notes: dto.notes,
        propertyType: dto.propertyType,
        isMainResidence: dto.isMainResidence,
        homeName: dto.homeName,
        homeDescription: dto.homeDescription,
        aboutNeighborhood: dto.aboutNeighborhood,
        homeImages: imageUrls,
        isAvailableForExchange: dto.isAvailableForExchange ?? true,
        availabilityStartDate: dto.availabilityStartDate,
        availabilityEndDate: dto.availabilityEndDate,

        favoriteDestinations: {
          create: favoriteDestinations,
        },

        onboardedAmenities: {
          create: dto.onboardedAmenities?.map((id) => ({
            amenity: { connect: { id } },
          })) || [],
        },
        onboardedTransports: {
          create: dto.onboardedTransports?.map((id) => ({
            transport: { connect: { id } },
          })) || [],
        },
        onboardedSurroundings: {
          create: dto.onboardedSurroundings?.map((id) => ({
            surrounding: { connect: { id } },
          })) || [],
        },
      },
    });

    return onboarding;
  }

  async findByUserId(userId: string) {
    const onboarding = await this.prisma.onboarding.findUnique({
      where: { userId },
      include: {
        onboardedAmenities: { include: { amenity: true } },
        onboardedTransports: { include: { transport: true } },
        onboardedSurroundings: { include: { surrounding: true } },
        favoriteDestinations: true,
      },
    });

    if (!onboarding) throw new NotFoundException('Onboarding not found');

    return onboarding;
  }

  async delete(userId: string) {
    return this.prisma.onboarding.delete({
      where: { userId },
    });
  }
}
