import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateOnboardingDto } from './dto/create-onboarding.dto';
import { cloudinary } from 'src/config/cloudinary.config';
import * as fs from 'fs';
import { PrismaService } from '../prisma/prisma.service';
import { DestinationType } from '@prisma/client';

@Injectable()
export class OnboardingService {
  constructor(private readonly prisma: PrismaService) {}

  async createOnboarding(
    userId: string,
    dto: CreateOnboardingDto,
    files: Express.Multer.File[],
  ) {
    // 1. Check if onboarding already exists
    const existing = await this.prisma.onboarding.findUnique({
      where: { userId },
    });
    if (existing) {
      throw new BadRequestException('User already onboarded');
    }

    // 2. Upload images to Cloudinary
    const uploadedImages: string[] = [];
    if (files?.length) {
      for (const file of files) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: 'onboarding_images',
          resource_type: 'image',
        });
        uploadedImages.push(result.secure_url);
        fs.unlinkSync(file.path); // cleanup
      }
    }

    // 3. Create Onboarding with nested creates
    const onboarding = await this.prisma.onboarding.create({
      data: {
        userId,
        ...dto,
        isTravelWithPets: dto.isTravelWithPets ?? false,
        homeImages: uploadedImages,
        favoriteDestinations: dto.favoriteDestinations?.map(
          (dest) => dest as DestinationType
        ) ?? [],
        onboardedAmenities: dto.onboardedAmenities?.length
          ? {
              create: dto.onboardedAmenities.map((id) => ({
                amenity: { connect: { id } },
              })),
            }
          : undefined,
        onboardedTransports: dto.onboardedTransports?.length
          ? {
              create: dto.onboardedTransports.map((id) => ({
                transport: { connect: { id } },
              })),
            }
          : undefined,
        onboardedSurroundings: dto.onboardedSurroundings?.length
          ? {
              create: dto.onboardedSurroundings.map((id) => ({
                surrounding: { connect: { id } },
              })),
            }
          : undefined,
      },
      include: {
        onboardedAmenities: true,
        onboardedTransports: true,
        onboardedSurroundings: true,
      },
    });
    
    return onboarding;
  }
}
