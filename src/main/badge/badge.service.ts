import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBadgeDto } from './dto/create-badge.dto';
import { UpdateBadgeDto } from './dto/update-badge.dto';
import { BadgeType } from '@prisma/client';
import { StorageService } from 'src/common/services/storage.service';

@Injectable()
export class BadgeService {
  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
  ) {}

  async create(dto: CreateBadgeDto) {
    const isExist = await this.prisma.badge.findFirst({ where: { type: dto.type } });
    if (isExist) throw new BadRequestException(`The Badge ${dto.type} already exists!`);
    return this.prisma.badge.create({ data: dto });
  }

  async update(id: string, dto: UpdateBadgeDto) {
    const badge = await this.prisma.badge.findUnique({ where: { id } });
    if (!badge) throw new NotFoundException(`Badge with ID ${id} not found`);

    // Check for unique type if being updated
    if (dto.type && dto.type !== badge.type) {
      const existing = await this.prisma.badge.findUnique({ where: { type: dto.type } });
      if (existing) throw new BadRequestException('Badge type already exists');
    }

    // Delete old icon if new file uploaded
    if (dto.iconPublicId && badge.iconPublicId) {
      await this.deleteFromStorage(badge.iconPublicId);
    }

    return this.prisma.badge.update({
      where: { id },
      data: { ...dto },
    });
  }

  async remove(id: string) {
    const badge = await this.prisma.badge.findUnique({ where: { id } });
    if (!badge) throw new NotFoundException(`Badge with ID ${id} not found`);
    if (badge.iconPublicId) await this.deleteFromStorage(badge.iconPublicId);
    return this.prisma.badge.delete({ where: { id } });
  }

  async findAll() {
    return this.prisma.badge.findMany();
  }

  async findByUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { achievementBadges: true },
    });
    return user?.achievementBadges || [];
  }

  async awardBadgeToUser(userId: string, badgeType: BadgeType) {
    const badge = await this.prisma.badge.findUnique({ where: { type: badgeType } });
    if (!badge) throw new NotFoundException(`Badge ${badgeType} not found`);

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { achievementBadges: true },
    });

    if (user?.achievementBadges.some(b => b.type === badgeType)) {
      return { message: "User already has this badge" };
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { achievementBadges: { connect: [{ id: badge.id }] } },
    });

    return { message: `Badge ${badge.displayName} awarded to user` };
  }

  // R2 storage helpers
   async uploadFile(file: Express.Multer.File, folder: string) {
    return this.storage.uploadFile(file, folder);
  }

  private async deleteFromStorage(publicId: string) {
    await this.storage.delete(publicId);
  }
}
