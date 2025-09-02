import { BadRequestException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { cloudinary } from 'src/config/cloudinary.config';
import * as fs from 'fs';

@Injectable()
export class PropertyService {
  constructor(private prisma: PrismaService) {}



  /** CREATE */
async createProperty(propertyData: any) {
  const uploadedImages: { url: string; publicId: string }[] = [];

  if (propertyData.files?.length) {
    for (const file of propertyData.files) {
      const uploaded = await this.uploadFile(file, 'property_images'); 
      // now returns { url, publicId }
      uploadedImages.push(uploaded);
    }
  }

  // Validate relations
  const validAmenities = propertyData.amenities?.length
    ? await this.prisma.amenity.findMany({ where: { id: { in: propertyData.amenities } } })
    : [];

  const validTransports = propertyData.transports?.length
    ? await this.prisma.transportOption.findMany({ where: { id: { in: propertyData.transports } } })
    : [];

  const validSurroundings = propertyData.surroundings?.length
    ? await this.prisma.surroundingType.findMany({ where: { id: { in: propertyData.surroundings } } })
    : [];

  return this.prisma.property.create({
    data: {
      title: propertyData.title,
      description: propertyData.description,
      location: propertyData.location,
      country: propertyData.country,
      price: propertyData.price,
      size: propertyData.size,
      propertyType: propertyData.propertyType,    
      maxPeople: propertyData.maxPeople,            
      isTravelWithPets: propertyData.isTravelWithPets ?? false,
      bedrooms: propertyData.bedrooms,
      bathrooms: propertyData.bathrooms,
      images: uploadedImages, 
      ownerId: propertyData.ownerId,

      // Relations
      amenities: { connect: validAmenities.map(a => ({ id: a.id })) },
      transports: { connect: validTransports.map(t => ({ id: t.id })) },
      surroundings: { connect: validSurroundings.map(s => ({ id: s.id })) },
    },
    include: {
      amenities: true,
      transports: true,
      surroundings: true,
    },
  });
}



  /** GET PROPERTIES */
  async getPropertiesByUserId(userId: string) {
    return this.prisma.property.findMany({
      where: { ownerId: userId,isDeleted:false},
      include: { 
        owner: true,
      amenities: true,
      transports: true,
      surroundings: true,
      },
    });
  }

async getAllProperty() {
  return this.prisma.property.findMany({
    where:{isDeleted:false},
    include: {
      owner: true,
      amenities: true,
      transports: true,
      surroundings: true,
    },
  });
}

async getPropertyById(id: string) {
  const property = await this.prisma.property.findUnique({
    where: { id ,isDeleted:false},
    include: {
      owner: true,
      amenities: true,
      transports: true,
      surroundings: true,
    },
  });
  if (!property) throw new NotFoundException(`Property with ID ${id} not found`);
  return property;
}
  /** UPDATE */
async updateProperty(id: string, updateData: any) {
  const existing = await this.prisma.property.findUnique({ where: { id ,isDeleted:false} });
  if (!existing) throw new NotFoundException(`Property with ID ${id} not found`);

  // Current images stored in DB
 let currentImages = (existing.images as { url: string; publicId: string }[]) || [];


  // Remove requested images
  if (updateData.removeImages?.length) {
    for (const publicId of updateData.removeImages) {
      await this.deleteFromCloudinary(publicId);
    }
    currentImages = currentImages.filter(img => !updateData.removeImages.includes(img.publicId));
  }

  // Add new images
  if (updateData.files?.length) {
    for (const file of updateData.files) {
      const uploaded = await this.uploadFile(file, 'property_images');
      currentImages.push(uploaded);
    }
  }

  // Validate relations
  const validAmenities = updateData.amenities?.length
    ? await this.prisma.amenity.findMany({ where: { id: { in: updateData.amenities } } })
    : [];

  const validTransports = updateData.transports?.length
    ? await this.prisma.transportOption.findMany({ where: { id: { in: updateData.transports } } })
    : [];

  const validSurroundings = updateData.surroundings?.length
    ? await this.prisma.surroundingType.findMany({ where: { id: { in: updateData.surroundings } } })
    : [];

  return this.prisma.property.update({
    where: { id },
    data: {
      ...updateData,
      files: undefined,
      removeImages: undefined,
      images: currentImages,

     propertyType: updateData.propertyType ?? existing.propertyType, 
     maxPeople: updateData.maxPeople ?? existing.maxPeople,    
     isTravelWithPets: updateData.isTravelWithPets ?? existing.isTravelWithPets, 


      amenities: { set: validAmenities.map(a => ({ id: a.id })) },
      transports: { set: validTransports.map(t => ({ id: t.id })) },
      surroundings: { set: validSurroundings.map(s => ({ id: s.id })) },
    },
    include: {
      amenities: true,
      transports: true,
      surroundings: true,
    },
  });
}

  /** DELETE */
  async deleteProperty(id: string) {
    const existing = await this.prisma.property.findUnique({ where: { id ,isDeleted:false } });
    if (!existing) throw new NotFoundException(`Property with ID ${id} not found`);

    await this.prisma.property.update({
       where: { id },
      data:{isDeleted:true}
     });
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


private async uploadFile(file: Express.Multer.File, folder: string) {
  try {
    const result = await cloudinary.uploader.upload(file.path, {
      folder,
      resource_type: 'auto',
    });
    if (fs.existsSync(file.path)) fs.unlinkSync(file.path);

    return { url: result.secure_url, publicId: result.public_id };
  } catch (error) {
    console.error(`Error uploading file ${file.path}:`, error);
    throw new BadRequestException('Failed to upload file');
  }
}


private async deleteFromCloudinary(publicId: string) {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error(`Error deleting image ${publicId} from Cloudinary:`, error);
  }
}



}
