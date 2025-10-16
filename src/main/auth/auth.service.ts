import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  HttpException,
  HttpStatus,
  ForbiddenException,
} from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import * as crypto from 'crypto';
import { MailService } from '../mail/mail.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { randomUUID } from 'crypto';
import { OtpService } from './services/otp.service';
import { generateUniqueSessionId } from 'src/utils/multer/generateUniqueSessionId';
import { BadgeService } from '../badge/badge.service';
import { BadgeType } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mailService: MailService,
    private otpService: OtpService,
    private badge:BadgeService
  ) {}

  async register(dto: RegisterDto) {
    const emailExists = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (emailExists) throw new BadRequestException('Email already in use');

    const pendingEmail = await this.prisma.pendingUser.findUnique({
      where: { email: dto.email },
    });
    if (pendingEmail)
      throw new BadRequestException('Email already pending verification');

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const fullName = `${dto.firstName} ${dto.lastName}`;

    const pending = await this.prisma.pendingUser.create({
      data: {
        fullName,
        email: dto.email,
        password: hashedPassword,
        referralCode: dto.referralCode,
      },
    });

    return {
      status: 'pending',
      message: 'Registration successful. Please verify your account via OTP.',
      userId: pending.id,
    };
  }

// Assuming your service function signature changes to include the IP address:
async login(dto: LoginDto, ipAddress: string) {
  const user = await this.prisma.user.findUnique({
    where: { email: dto.email },
    // You might also include activeSessions here if you wanted to check them immediately, 
    // but a separate count is often cleaner for concurrent checks.
    include: { achievementBadges: true }, 
  });

  if (!user) throw new UnauthorizedException('Invalid credentials');

  // --- 1. Check for Account Suspension ---
  if (user.isSuspended) {
    throw new ForbiddenException(`Account suspended: ${user.suspensionReason || 'Contact support for details.'}`);
  }

  const valid = await bcrypt.compare(dto.password, user.password);
  if (!valid) throw new UnauthorizedException('Invalid credentials');

  // --- 2. Enforce the Concurrent Device Limit (3) ---
  const MAX_SESSIONS = 3;

  const activeSessionCount = await this.prisma.activeSession.count({
    where: { userId: user.id },
  });

  if (activeSessionCount >= MAX_SESSIONS) {
    const suspensionReason = 'Exceeded concurrent device limit (3).';

    await this.prisma.user.update({
      where: { id: user.id },
      data: { 
        isSuspended: true, 
        suspensionReason: suspensionReason,
      },
    });

    // You could optionally log out all existing sessions here if you wanted.
    // For now, we just deny the new login and notify the user.
    throw new ForbiddenException(`Login denied. Account suspended due to too many active devices. Please contact support.`);
  }

  // --- 3. Login is Valid: Create a new Active Session ---

  const token = await this.signToken(user); 
  const sessionToken =await generateUniqueSessionId(); // Example helper

  await this.prisma.activeSession.create({
    data: {
      userId: user.id,
      ipAddress: ipAddress,
      sessionToken: sessionToken, 
     
    },
  });

  return token;
}

  private async signToken(user: any) {
    const payload = { id: user.id, email: user.email, role: user.role,sessionToken:user.sessionToken };
    const accessToken = await this.jwtService.signAsync(payload);

    const { password, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword,
      accessToken,
    };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) throw new BadRequestException('User not found');

    const token = crypto.randomBytes(32).toString('hex');
    const hashed = await bcrypt.hash(token, 10);

    await this.prisma.user.update({
      where: { email: dto.email },
      data: {
        resetToken: hashed,
        resetTokenExpiry: new Date(Date.now() + 1000 * 60 * 15),
      },
    });

    await this.mailService.sendResetPasswordEmail(dto.email, token);
    return { message: 'Reset email sent' };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const users = await this.prisma.user.findMany({
      where: {
        resetToken: {
          not: null,
        },
        resetTokenExpiry: {
          gte: new Date(),
        },
      },
    });

    const matchedUser = await Promise.any(
      users.map(async (user) => {
        const isValid = await bcrypt.compare(
          dto.token,
          user.resetToken as string,
        );
        if (isValid) return user;
        throw new Error();
      }),
    ).catch(() => null);

    if (!matchedUser) throw new BadRequestException('Invalid or expired token');

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

    await this.prisma.user.update({
      where: { id: matchedUser.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return { message: 'Password reset successfully' };
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) throw new BadRequestException('User not found');

    const isMatch = await bcrypt.compare(dto.currentPassword, user.password);
    if (!isMatch)
      throw new BadRequestException('Current password is incorrect');

    const hashedNewPassword = await bcrypt.hash(dto.newPassword, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    return { message: 'Password changed successfully' };
  }

  // Called after registration to start OTP verification
  async sendOtp(pendingUserId: string, method: 'email' | 'phone') {
    const user = await this.prisma.pendingUser.findUnique({
      where: { id: pendingUserId },
    });
    if (!user) throw new BadRequestException('Pending user not found');

    const otp = this.otpService.generateOtp();

    await this.prisma.otpVerification.create({
      data: {
        id: randomUUID(),
        otp,
        userId: pendingUserId,
        method,
        expiresAt: new Date(Date.now() + 1000 * 60 * 5),
      },
    });

    if (method === 'email') {
      await this.otpService.sendOtpByEmail(user.email, otp);
    } else {
      await this.otpService.sendOtpByPhone(user.phoneNumber!, otp);
    }

    return { message: 'OTP sent successfully' };
  }

  async verifyOtp(pendingUserId: string, otp: string) {
    // 1. Check if OTP is valid and not expired
    const record = await this.prisma.otpVerification.findFirst({
      where: {
        userId: pendingUserId,
        otp,
        expiresAt: { gte: new Date() },
        verifiedAt: null,
      },
    });

    if (!record) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    // 2. Mark OTP as verified
    await this.prisma.otpVerification.update({
      where: { id: record.id },
      data: { verifiedAt: new Date() },
    });

    // 3. Fetch the pending user
    const pending = await this.prisma.pendingUser.findUnique({
      where: { id: pendingUserId },
    });

    if (!pending) {
      throw new BadRequestException('Pending user not found');
    }

    // // 4. Ensure phoneNumber is not null (avoid runtime error)
    // if (!pending.phoneNumber) {
    //   throw new BadRequestException('Phone number is missing for the user');
    // }

    let referredByUser: any = null;
    if (pending.referralCode) {
      referredByUser = await this.prisma.user.findUnique({
        where: {
          referralCode: pending.referralCode,
        },
      });
    }
    // 5. Create actual user

    const isExistUser=await this.prisma.user.findUnique({
      where: {
        email: pending.email,
      },
    })
    if(isExistUser){
      throw new BadRequestException('User already exist');
    }
    const user = await this.prisma.user.create({
      data: {
        fullName: pending.fullName,
        email: pending.email,
        password: pending.password,
        referredBy: pending.referralCode,
        role:pending.role
      },
    });

    if (referredByUser) {
    const user=  await this.prisma.user.update({
        where: { id: referredByUser.id },
        data: {
          balance: { increment: 3 },
          totalReferrals: { increment: 1 }
        },
      });
      if(user.totalReferrals==1){
        await this.badge.awardBadgeToUser(user.id,BadgeType.GOLDEN_HOST)
      }else if(user.totalReferrals===3){
        await this.badge.awardBadgeToUser(user.id,BadgeType.LOTS_OF_FRIENDS)
      }else if(user.totalReferrals===10){
        await this.badge.awardBadgeToUser(user.id,BadgeType.PURE_CHARISMA)
      }else if(user.totalReferrals===50){
        await this.badge.awardBadgeToUser(user.id,BadgeType.VIP)
      }else if(user.totalReferrals===200){
        await this.badge.awardBadgeToUser(user.id,BadgeType.DIAMOND_VIP)
      }
    }
    // 6. Clean up related OTPs to avoid FK issues
    await this.prisma.otpVerification.deleteMany({
      where: { userId: pendingUserId },
    });

    // 7. Delete pending user entry
    await this.prisma.pendingUser.delete({
      where: { id: pendingUserId },
    });

    // 8. Generate token
    const tokenData = await this.signToken(user);

    return {
      status: 'verified',
      message: 'OTP verified successfully. User registered.',
      ...tokenData,
    };
  }

  async resendOtp(userId: string, method: 'email' | 'phone') {
    // Optional: Enforce 60-second delay
    const lastOtp = await this.prisma.otpVerification.findFirst({
      where: {
        userId,
        method,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (lastOtp && Date.now() - new Date(lastOtp.createdAt).getTime() < 60000) {
      throw new BadRequestException('Please wait before resending OTP');
    }

    return this.sendOtp(userId, method);
  }



async createSuperAdmin(){
  try{
    const hassPassword = await bcrypt.hash(process.env.SUPER_ADMIN_PASSWORD as string, 10);
  const existingSuperAdmin = await this.prisma.pendingUser.findUnique({
    where: { email: process.env.SUPER_ADMIN_EMAIL as string },
  });

  if (existingSuperAdmin) {
    throw new HttpException('Super admin already exists',HttpStatus.BAD_REQUEST)
  }
  const superAdmin = await this.prisma.pendingUser.create({
    data: {
      fullName: 'Super Admin',
      email:process.env.SUPER_ADMIN_EMAIL as string,
      password: hassPassword,
      role: 'SUPER_ADMIN',
    }
  });
  return superAdmin;
  }catch(err){
    throw new HttpException(err.message,HttpStatus.BAD_REQUEST)
  }
}


async logout(userId: string, sessionToken: string) {
    try {
      const result = await this.prisma.activeSession.deleteMany({
        where: {
          userId: userId,
          sessionToken: sessionToken,
        },
      });
      if (result.count === 0) {
        console.warn(`Logout attempt for session ${sessionToken} failed (session not found).`);
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }



async terminateAllSessions(userId: string): Promise<void> {

  const deleteResult = await this.prisma.activeSession.deleteMany({
    where: { userId: userId },
  });

  await this.prisma.user.update({
    where: { id: userId },
    data: { 
      isSuspended: false,
      suspensionReason: null, 
    },
  });

  console.log(`User ${userId} unsuspended. Terminated ${deleteResult.count} sessions.`);
}



async validateUserCredentials(email: string, password: string) {
  const user = await this.prisma.user.findUnique({
    where: { email: email },
  });

  if (!user) return null;

  const valid = await bcrypt.compare(password, user.password);
  
  return valid ? user : null;
}
}
