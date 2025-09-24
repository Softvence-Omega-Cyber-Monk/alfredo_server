import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';

@Injectable()
export class PlanService {
  constructor(private prisma: PrismaService) {}

  // Create plan with translations
  async create(data: CreatePlanDto) {
    // Check if any translation with the same name already exists in same language
    for (const t of data.translations) {
      const existing = await this.prisma.planTranslation.findFirst({
        where: {
          name: t.name,
          language: t.language,
        },
      });
      if (existing) {
        throw new BadRequestException(`Plan name "${t.name}" already exists for language "${t.language}"`);
      }
    }

    // Create plan with nested translations
    const plan = await this.prisma.plan.create({
      data: {
        price: data.price,
        priceId: data.priceId,
        status: data.status,
        translations: {
          create: data.translations.map((t) => ({
            language: t.language,
            name: t.name,
            description: t.description,
            features: t.features,
            planDuration: t.planDuration,
            planType: t.planType,
          })),
        },
      },
      include: {
        translations: true,
      },
    });

    return plan;
  }

  // Find all active plans with translations
  async findAll(language?: string) {
    return this.prisma.plan.findMany({
      where: { status: 'ACTIVE' },
      include: {
        translations: language
          ? { where: { language } } // return only requested language
          : true, // return all translations
      },
    });
  }

  // Find one plan by ID with translations
  async findOne(id: string, language?: string) {
    const plan = await this.prisma.plan.findUnique({
      where: { id },
      include: {
        translations: language ? { where: { language } } : true,
      },
    });

    if (!plan) throw new NotFoundException('Plan not found');

    return plan;
  }

  // Update plan (base fields + translations)
  async update(id: string, dto: UpdatePlanDto) {
    const existingPlan = await this.prisma.plan.findUnique({
      where: { id },
      include: { translations: true },
    });

    if (!existingPlan) throw new NotFoundException('Plan not found');

    // Update base plan fields
    const updatedPlan = await this.prisma.plan.update({
      where: { id },
      data: {
        price: dto.price ?? existingPlan.price,
        priceId: dto.priceId ?? existingPlan.priceId,
        status: dto.status ?? existingPlan.status,
      },
    });

    // Update translations if provided
    if (dto.translations && dto.translations.length > 0) {
      for (const t of dto.translations) {
        const translation = existingPlan.translations.find(
          (tr) => tr.language === t.language
        );

        if (translation) {
          // Update existing translation
          await this.prisma.planTranslation.update({
            where: { id: translation.id },
            data: {
              name: t.name ?? translation.name,
              description: t.description ?? translation.description,
              features: t.features ?? translation.features,
              planDuration: t.planDuration ?? translation.planDuration,
              planType: t.planType ?? translation.planType,
            },
          });
        } else {
          // Create new translation
          await this.prisma.planTranslation.create({
            data: {
              planId: id,
              language: t.language,
              name: t.name,
              description: t.description,
              features: t.features,
              planDuration: t.planDuration,
              planType: t.planType,
            },
          });
        }
      }
    }

    return this.findOne(id);
  }

  // Remove plan (cascades translations)
  async remove(id: string) {
    const existingPlan = await this.prisma.plan.findUnique({ where: { id } });
    if (!existingPlan) throw new NotFoundException('Plan not found');

    return this.prisma.plan.delete({ where: { id } });
  }
}
