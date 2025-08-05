import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '@nestjs/config';
import { UploadApiResponse } from 'cloudinary';
import { CreateOnboardingDto, UpdateOnboardingDto } from './dto/create-onboarding.dto';

@Injectable()
export class OnboardingService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  async uploadImages(files: Express.Multer.File[]): Promise<string[]> {
    const uploadPromises = files.map(
      (file) =>
        new Promise<string>((resolve, reject) => {
          cloudinary.uploader
            .upload_stream({ resource_type: 'image' }, (error, result) => {
              if (error || !result) {
                reject(new Error(`Cloudinary upload failed: ${error?.message || 'No result'}`));
              } else {
                resolve(result.secure_url);
              }
            })
            .end(file.buffer);
        }),
    );
    return Promise.all(uploadPromises);
  }

  async createOnboarding(userId: string, dto: CreateOnboardingDto) {
    const imageUrls = dto.homeImages ? await this.uploadImages(dto.homeImages) : [];

    return this.prisma.onboarding.create({
      data: {
        userId,
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
        homeImages: imageUrls,
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

    const imageUrls = dto.homeImages ? await this.uploadImages(dto.homeImages) : undefined;

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
      homeImages: imageUrls,
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

    // Optionally delete images from Cloudinary
    if (onboarding.homeImages?.length > 0) {
      const publicIds = onboarding.homeImages.map(url => url.split('/').pop()?.split('.')[0]).filter(Boolean) as string[];
      await Promise.all(publicIds.map(id => cloudinary.uploader.destroy(id)));
    }

    await this.prisma.onboarding.delete({
      where: { userId },
    });

    return { message: 'Onboarding deleted successfully' };
  }
}