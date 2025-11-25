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
      select: {
        id: true,
        fullName: true,
        email: true,
        phoneNumber: true,
        photo: true,
        role: true,
        isSubscribed: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  // Get a single user by ID
  async getUser(userId: string) {
    console.log(userId)
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include:{
        achievementBadges:true,
        onboarding:true
      }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }
    const {password,...userInfo}=user

    return userInfo;
  }

 
async updateMe(userId: string, dto: UpdateUserDto, file?: Express.Multer.File) {
  let photoUrl: string | undefined = undefined;

  // Upload photo to Cloudinary if file exists
  if (file) {
    try {
      photoUrl = await this.uploadPhotoToCloudinary(file);
      console.log(photoUrl)
    } catch (error) {
      throw new BadRequestException('Photo upload failed: ' + error.message);
    }
  }

  // Update user fields
  const updatedUser = await this.prisma.user.update({
    where: { id: userId },
    data: {
      fullName: dto.fullName ?? undefined,
      email: dto.email ?? undefined,
      phoneNumber: dto.phoneNumber ?? undefined,
      city: dto.city ?? undefined,
      age: dto.age ?? undefined,
      dateOfBirth: dto.dateOfBirth ?? undefined,
      identification: dto.identification ?? undefined,
      languagePreference: dto.languagePreference ?? undefined,
      photo: photoUrl ?? undefined,
    },
  });

  // Update onboarding if exists
  const existingOnboarding = await this.prisma.onboarding.findUnique({
    where: { userId },
  });

  if (existingOnboarding) {
    await this.prisma.onboarding.update({
      where: { userId },
      data: {
        homeAddress: dto.homeAddress ?? undefined,
        travelType: dto.travelType ?? undefined,
        favoriteDestinations: dto.favoriteDestinations ?? undefined,
        isTravelWithPets: dto.isTravelWithPets ?? undefined,
        notes: dto.notes ?? undefined,
        homeDescription: dto.homeDescription ?? undefined,
        aboutNeighborhood: dto.aboutNeighborhood ?? undefined,
        isAvailableForExchange: dto.isAvailableForExchange ?? undefined,
        availabilityStartDate: dto.availabilityStartDate ?? undefined,
        availabilityEndDate: dto.availabilityEndDate ?? undefined,
        maxPeople: dto.maxPeople ?? undefined,
        propertyType: dto.propertyType ?? undefined,
        isMainResidence: dto.isMainResidence ?? undefined,
        homeName: dto.homeName ?? undefined,
      },
    });
  }

  // Return updated user with onboarding
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
      throw new NotFoundException("User not found")
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
