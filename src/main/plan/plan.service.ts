import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';

@Injectable()
export class PlanService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreatePlanDto) {
    const isExistPlan =await this.prisma.plan.findUnique({
      where: { name: data.name },
    });
    if (isExistPlan) {
      throw new NotFoundException('Plan already exist');
    }
    const response = await this.prisma.plan.create({ data });
    return response;
  }

  findAll() {
    return this.prisma.plan.findMany({ where: { status: 'ACTIVE' } });
  }

  findOne(id: string) {
    return this.prisma.plan.findUnique({ where: { id } });
  }

  async update(id: string, dto: UpdatePlanDto) {
    // Fetch current plan
    const existingPlan = await this.prisma.plan.findUnique({ where: { id } });

    if (!existingPlan) {
      throw new NotFoundException('Plan not found');
    }

    // Merge features if provided
    let updatedFeatures = existingPlan.features;
    if (dto.features && dto.features.length > 0) {
      const existingSet = new Set(existingPlan.features);
      dto.features.forEach((feature) => existingSet.add(feature));
      updatedFeatures = Array.from(existingSet);
    }

    return this.prisma.plan.update({
      where: { id },
      data: {
        ...dto,
        features: updatedFeatures,
      },
    });
  }

  remove(id: string) {
    return this.prisma.plan.delete({ where: { id } });
  }
}
