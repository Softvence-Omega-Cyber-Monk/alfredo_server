import { BadRequestException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { cloudinary } from 'src/config/cloudinary.config';
import * as fs from 'fs';

@Injectable()
export class PropertyService {
  constructor(private prisma: PrismaService) {}

  private async uploadFile(file: Express.Multer.File, folder: string): Promise<string> {
    try {
      const result = await cloudinary.uploader.upload(file.path, {
        folder,
        resource_type: 'auto',
      });
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path); 
      return result.secure_url;
    } catch (error) {
      console.error(`Error uploading file ${file.path}:`, error);
      throw new BadRequestException('Failed to upload file');
    }
  }

  /** CREATE */
  async createProperty(propertyData: any) {
    const uploadedImages: string[] = [];

    if (propertyData.files?.length) {
      for (const file of propertyData.files) {
        const url = await this.uploadFile(file, 'onboarding_images');
        uploadedImages.push(url);
      }
    }

    return this.prisma.property.create({
      data: {
        ...propertyData,
        files: undefined, // prevent saving raw files
        images: uploadedImages,
      },
    });
  }

  /** GET PROPERTIES */
  async getPropertiesByUserId(userId: string) {
    return this.prisma.property.findMany({
      where: { ownerId: userId },
      include: { owner: true },
    });
  }

  async getAllProperty() {
    return this.prisma.property.findMany({
      include: { owner: true },
    });
  }

  async getPropertyById(id: string) {
    const property = await this.prisma.property.findUnique({
      where: { id },
      include: { owner: true },
    });
    if (!property) throw new NotFoundException(`Property with ID ${id} not found`);
    return property;
  }

  /** UPDATE */
  async updateProperty(id: string, updateData: any) {
    const existing = await this.prisma.property.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Property with ID ${id} not found`);

    let uploadedImages: string[] = existing.images || [];

    if (updateData.files?.length) {
      for (const file of updateData.files) {
        const url = await this.uploadFile(file, 'onboarding_images');
        uploadedImages.push(url);
      }
    }

    return this.prisma.property.update({
      where: { id },
      data: {
        ...updateData,
        files: undefined,
        images: uploadedImages,
      },
    });
  }

  /** DELETE */
  async deleteProperty(id: string) {
    const existing = await this.prisma.property.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Property with ID ${id} not found`);

    await this.prisma.property.delete({ where: { id } });
    return { message: `Property with ID ${id} deleted successfully` };
  }

  /** FAVORITES */
 async favoriteProperty(userId: string, propertyId: string) {
  // Check if this user has already favorited this property
  const existing = await this.prisma.favorite.findFirst({
    where: {
      userId,
      propertyId
    },
  });

  // If it exists, return it or null (do nothing)
  if (existing) {
     throw new HttpException("Property already favorited",HttpStatus.BAD_REQUEST)
  }

  // Otherwise, create a new favorite
  return this.prisma.favorite.create({
    data: { userId, propertyId },
  });
}


  async deleteFavorite(userId: string, propertyId: string) {
    return this.prisma.favorite.deleteMany({
      where: { userId, propertyId },
    });
  }

  async getUserFavorites(userId: string) {
    const favorites = await this.prisma.favorite.findMany({
      where: { userId },
      include: { property: true },
    });
    return favorites.map(fav => fav.property);
  }
}
