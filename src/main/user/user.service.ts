import {
  BadRequestException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { Express } from 'express';
import { v2 as cloudinary } from 'cloudinary';
import * as streamifier from 'streamifier';
import '../../config/cloudinary.config';
import { BadgeService } from '../badge/badge.service';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private readonly badgeService:BadgeService
  ) {}

  private async uploadPhotoToCloudinary(
    file: Express.Multer.File,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',
          folder: 'user_photos',
        },
        (error, result) => {
          if (error) reject(error);
          else if (result?.secure_url) resolve(result.secure_url);
          else reject(new Error('No secure URL returned from Cloudinary'));
        },
      );
      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }

  // Get all users (without sensitive info)
  async getAllUsers() {
    return this.prisma.user.findMany({
      include:{
        achievementBadges:true,
        onboarding:true,
        properties:true
      
      }
    });
  }

  // Get a single user by ID
  async getUser(userId: string) {
    console.log(userId)
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include:{
        achievementBadges:true,
        onboarding:true,
        properties:true
      }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }
    const {password,...userInfo}=user

    return userInfo;
  }

 
async updateMe(userId: string, dto: UpdateUserDto, file?: Express.Multer.File) {
  
  const parseArray = (value: any) => {
    if (!value) return undefined;
    if (Array.isArray(value)) return value;
    if (typeof value === "string") return value.split(',').map(v => v.trim());
    return undefined;
  };

  const parseBool = (value: any) => {
    if (value === undefined || value === null) return undefined;
    if (typeof value === "boolean") return value;
    if (value === "true") return true;
    if (value === "false") return false;
    return undefined;
  };

  const parseNumber = (value: any) => {
    if (value === undefined || value === null) return undefined;
    const n = Number(value);
    return isNaN(n) ? undefined : n;
  };

  // ---- File upload ----
  let photoUrl: string | undefined = undefined;
  if (file) {
    photoUrl = await this.uploadPhotoToCloudinary(file);
  }

  // ---- Update User ----
  await this.prisma.user.update({
    where: { id: userId },
    data: {
      fullName: dto.fullName ?? undefined,
      phoneNumber: dto.phoneNumber ?? undefined,
      city: dto.city ?? undefined,
      dateOfBirth: dto.dateOfBirth ?? undefined,
      identification: dto.identification ?? undefined,
      languagePreference: dto.languagePreference ?? undefined,
      photo: photoUrl ?? undefined,
    },
  });

  // ---- Update Onboarding ----
  const existingOnboarding = await this.prisma.onboarding.findUnique({
    where: { userId },
  });

  if (existingOnboarding) {
    await this.prisma.onboarding.update({
      where: { userId },
      data: {
        homeAddress: dto.homeAddress ?? undefined,
        travelType: parseArray(dto.travelType),
        favoriteDestinations: parseArray(dto.favoriteDestinations),
        isTravelWithPets: parseBool(dto.isTravelWithPets),
        travelMostlyWith: dto.travelMostlyWith ?? undefined,
        notes: dto.notes ?? undefined,
        ageRange:dto.age??undefined,
        homeDescription: dto.homeDescription ?? undefined,
        aboutNeighborhood: dto.aboutNeighborhood ?? undefined,
        isAvailableForExchange: parseBool(dto.isAvailableForExchange),
        availabilityStartDate: dto.availabilityStartDate ?? undefined,
        availabilityEndDate: dto.availabilityEndDate ?? undefined,
        maxPeople: parseNumber(dto.maxPeople),
        propertyType: dto.propertyType ?? undefined,
        isMainResidence: parseBool(dto.isMainResidence),
        homeName: dto.homeName ?? undefined,
      },
    });
  }

  return this.prisma.user.findUnique({
    where: { id: userId },
    include: { onboarding: true },
  });
}



  // Update user role (admin-only)
  async updateUserRole(userId: string, role: string) {
    if (!role) {
      throw new BadRequestException('Role is required');
    }

    const validRoles = ['ADMIN', 'USER', 'MODERATOR']; // adjust as needed
    if (!validRoles.includes(role)) {
      throw new BadRequestException(
        `Role must be one of: ${validRoles.join(', ')}`,
      );
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: { role: role as any },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        updatedAt: true,
      },
    });
  }

  // Delete a user
  async deleteUser(userId: string) {
    const isExist=await this.prisma.user.findFirst({
      where:{
        id:userId
      }
    })
    if(!isExist){
      throw new NotFoundException("User not found..")
    }
    await this.prisma.user.delete({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        email: true,
      },
    });
    return{
      status:HttpStatus.OK,
      message:"user deleted succesfull"
    }
  }


  //* give bathc to user by admin
  async giveBadgesToUser(userId:string,badgeType:any){
    const user=await this.prisma.user.findFirst({
      where:{
        id:userId
      }
    })
    if(!user){
      throw new NotFoundException("User not found")
    }
    const isBadgeExist=await this.prisma.badge.findFirst({
      where:{
        type:badgeType
      }
    })
    if(!isBadgeExist){
      throw new NotFoundException("Badge not found in  you database")
    }
    const badge=await this.badgeService.awardBadgeToUser(userId,badgeType)
    return badge
  }
}
