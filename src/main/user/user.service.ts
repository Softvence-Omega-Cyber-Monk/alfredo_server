import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { Express } from 'express';
import { v2 as cloudinary } from 'cloudinary';
import * as streamifier from 'streamifier';
import '../../config/cloudinary.config';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

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
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        phoneNumber: true,
        photo: true,
        role: true,
        isSubscribed: true,
        subscriptions: true,
        notifications: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

 
  async updateMe(userId: string, dto: UpdateUserDto, file?: Express.Multer.File) {
    const userExists = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!userExists) {
      throw new NotFoundException('User not found');
    }

    let photoUrl: string | undefined;
    if (file) {
      photoUrl = await this.uploadPhotoToCloudinary(file);
    }

    const { photo, city, achievementBadges, paymentCardNumber, ...updateData } = dto;
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        ...updateData,
        ...(photoUrl ? { photo: photoUrl } : {}),
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phoneNumber: true,
        photo: true,
        role: true,
        isSubscribed: true,
        subscriptions: true,
        notifications: true,
        createdAt: true,
        updatedAt: true,
      },
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
    return this.prisma.user.delete({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        email: true,
      },
    });
  }
}
