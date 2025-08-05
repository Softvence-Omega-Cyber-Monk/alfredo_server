import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateOnboardingDto, UpdateOnboardingDto } from './dto/create-onboarding.dto';

@Injectable()
export class OnboardingService {
  constructor(private prisma: PrismaService) {}

  async createOnboarding(dto: CreateOnboardingDto) {
    return this.prisma.onboarding.create({
      data: {
        userId: dto.userId,
        homeAddress: dto.homeAddress,
        destination: dto.destination,
        ageRange: dto.ageRange,
        gender: dto.gender,
        employmentStatus: dto.employmentStatus,
        travelType: dto.travelType,
        travelMostlyWith: dto.travelMostlyWith,
        isTravelWithPets: dto.isTravelWithPets,
        notes: dto.notes,
        propertyType: dto.propertyType,
        isMainResidence: dto.isMainResidence,
        homeName: dto.homeName,
        homeDescription: dto.homeDescription,
        aboutNeighborhood: dto.aboutNeighborhood,
        homeImages: dto.homeImages,
        isAvailableForExchange: dto.isAvailableForExchange,
        availabilityStartDate: dto.availabilityStartDate ? new Date(dto.availabilityStartDate) : undefined,
        availabilityEndDate: dto.availabilityEndDate ? new Date(dto.availabilityEndDate) : undefined,
        favoriteDestinations: {
          create: dto.favoriteDestinations.map(type => ({ type })),
        },
        onboardedAmenities: {
          create: dto.amenityIds.map(amenityId => ({
            amenity: { connect: { id: amenityId } },
          })),
        },
        onboardedTransports: {
          create: dto.transportIds.map(transportId => ({
            transport: { connect: { id: transportId } },
          })),
        },
        onboardedSurroundings: {
          create: dto.surroundingIds.map(surroundingId => ({
            surrounding: { connect: { id: surroundingId } },
          })),
        },
      },
      include: {
        favoriteDestinations: true,
        onboardedAmenities: { include: { amenity: true } },
        onboardedTransports: { include: { transport: true } },
        onboardedSurroundings: { include: { surrounding: true } },
      },
    });
  }

  async getOnboardingByUserId(userId: string) {
    const onboarding = await this.prisma.onboarding.findUnique({
      where: { userId },
      include: {
        favoriteDestinations: true,
        onboardedAmenities: { include: { amenity: true } },
        onboardedTransports: { include: { transport: true } },
        onboardedSurroundings: { include: { surrounding: true } },
      },
    });

    if (!onboarding) {
      throw new NotFoundException(`Onboarding not found for user ${userId}`);
    }

    return onboarding;
  }

  async updateOnboarding(userId: string, dto: UpdateOnboardingDto) {
    const existingOnboarding = await this.prisma.onboarding.findUnique({
      where: { userId },
      include: {
        favoriteDestinations: true,
        onboardedAmenities: true,
        onboardedTransports: true,
        onboardedSurroundings: true,
      },
    });

    if (!existingOnboarding) {
      throw new NotFoundException(`Onboarding not found for user ${userId}`);
    }

    // Prepare update data
    const updateData: Prisma.OnboardingUpdateInput = {
      homeAddress: dto.homeAddress,
      destination: dto.destination,
      ageRange: dto.ageRange,
      gender: dto.gender,
      employmentStatus: dto.employmentStatus,
      travelType: dto.travelType,
      travelMostlyWith: dto.travelMostlyWith,
      isTravelWithPets: dto.isTravelWithPets,
      notes: dto.notes,
      propertyType: dto.propertyType,
      isMainResidence: dto.isMainResidence,
      homeName: dto.homeName,
      homeDescription: dto.homeDescription,
      aboutNeighborhood: dto.aboutNeighborhood,
      homeImages: dto.homeImages,
      isAvailableForExchange: dto.isAvailableForExchange,
      availabilityStartDate: dto.availabilityStartDate ? new Date(dto.availabilityStartDate) : undefined,
      availabilityEndDate: dto.availabilityEndDate ? new Date(dto.availabilityEndDate) : undefined,
    };

    // Handle favorite destinations
    if (dto.favoriteDestinations) {
      updateData.favoriteDestinations = {
        deleteMany: {},
        create: dto.favoriteDestinations.map(type => ({ type })),
      };
    }

    // Handle amenities
    if (dto.amenityIds) {
      updateData.onboardedAmenities = {
        deleteMany: {},
        create: dto.amenityIds.map(amenityId => ({
          amenity: { connect: { id: amenityId } },
        })),
      };
    }

    // Handle transports
    if (dto.transportIds) {
      updateData.onboardedTransports = {
        deleteMany: {},
        create: dto.transportIds.map(transportId => ({
          transport: { connect: { id: transportId } },
        })),
      };
    }

    // Handle surroundings
    if (dto.surroundingIds) {
      updateData.onboardedSurroundings = {
        deleteMany: {},
        create: dto.surroundingIds.map(surroundingId => ({
          surrounding: { connect: { id: surroundingId } },
        })),
      };
    }

    return this.prisma.onboarding.update({
      where: { userId },
      data: updateData,
      include: {
        favoriteDestinations: true,
        onboardedAmenities: { include: { amenity: true } },
        onboardedTransports: { include: { transport: true } },
        onboardedSurroundings: { include: { surrounding: true } },
      },
    });
  }

  async deleteOnboarding(userId: string) {
    const onboarding = await this.prisma.onboarding.findUnique({
      where: { userId },
    });

    if (!onboarding) {
      throw new NotFoundException(`Onboarding not found for user ${userId}`);
    }

    await this.prisma.onboarding.delete({
      where: { userId },
    });

    return { message: 'Onboarding deleted successfully' };
  }
}