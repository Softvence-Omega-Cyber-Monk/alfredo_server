import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateOnboardingDto } from './dto/create-onboarding.dto';
import { cloudinary } from 'src/config/cloudinary.config'; // 👈 using existing cloudinary setup
import * as fs from 'fs';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OnboardingService {
  constructor(private readonly prisma: PrismaService) {}

  async createOnboarding(
    userId: string,
    dto: CreateOnboardingDto,
    files: Express.Multer.File[],
  ) {
    // ❗ 1. Check if onboarding already exists
    const existing = await this.prisma.onboarding.findUnique({
      where: { userId },
    });
    if (existing) throw new BadRequestException('User already onboarded');

    // ✅ 2. Upload images to Cloudinary
    const uploadedImages: string[] = [];

    for (const file of files) {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: 'onboarding_images',
        resource_type: 'image',
      });
      uploadedImages.push(result.secure_url);

      // ✅ Clean up local file (optional)
      fs.unlinkSync(file.path);
    }

    // ✅ 3. Create Onboarding
    const onboarding = await this.prisma.onboarding.create({
      data: {
        userId,
        ...dto,
        isTravelWithPets: dto.isTravelWithPets ?? false, // 👈 FIX HERE
        homeImages: uploadedImages,
        favoriteDestinations: {
          create:
            dto.favoriteDestinations?.map((d) => ({
              type: d.type,
            })) || [],
        },
        onboardedAmenities: {
          create:
            dto.onboardedAmenities?.map((id) => ({
              amenity: { connect: { id } },
            })) || [],
        },
        onboardedTransports: {
          create:
            dto.onboardedTransports?.map((id) => ({
              transport: { connect: { id } },
            })) || [],
        },
        onboardedSurroundings: {
          create:
            dto.onboardedSurroundings?.map((id) => ({
              surrounding: { connect: { id } },
            })) || [],
        },
      },
    });

    return onboarding;
  }
}
