// property.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PropertyService {
  constructor(private prisma: PrismaService) {}

  /** CREATE */
  async createProperty(propertyData: any) {
    const res = await this.prisma.property.create({
      data: {
        ...propertyData,
      },
    });
    return res;
  }

  async getPropertiesByUserId(userId: string) {
    const properties = await this.prisma.property.findMany({
      where: { ownerId: userId },
      include: { owner: true },
    });
    return properties;
  }
  /** READ ALL */
  async getAllProperty() {
    const res = await this.prisma.property.findMany({
      include: {
        owner: true, // include owner relation
      },
    });
    return res;
  }

  /** READ BY ID */
  async getPropertyById(id: string) {
    const property = await this.prisma.property.findUnique({
      where: { id },
      include: { owner: true },
    });
    if (!property) {
      throw new NotFoundException(`Property with ID ${id} not found`);
    }
    return property;
  }

  /** UPDATE */
  async updateProperty(id: string, updateData: any) {
    // Check if property exists
    const existing = await this.prisma.property.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Property with ID ${id} not found`);
    }

    const updated = await this.prisma.property.update({
      where: { id },
      data: { ...updateData },
    });
    return updated;
  }

  /** DELETE */
  async deleteProperty(id: string) {
    // Check if property exists
    const existing = await this.prisma.property.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Property with ID ${id} not found`);
    }

    await this.prisma.property.delete({ where: { id } });
    return { message: `Property with ID ${id} deleted successfully` };
  }


  // Favorite a property
  async favoriteProperty(userId: string, propertyId: string) {
    const favorite = await this.prisma.favorite.create({
      data: {
        userId,
        propertyId
      },
    });
    return favorite;
  }

async deleteFavorite(userId: string, propertyId: string) {
  const favorite = await this.prisma.favorite.deleteMany({
    where: {
      userId,
      propertyId,
    },
  });
  return favorite;
}

async getUserFavorites(userId: string) {
  const favorites = await this.prisma.favorite.findMany({
    where: { userId },
    include: { property: true },
  });
  return favorites.map(fav => fav.property);
}

}
