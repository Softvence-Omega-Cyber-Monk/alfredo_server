import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { cloudinary } from 'src/config/cloudinary.config';
import * as fs from 'fs';
import { CreateOnboardingDto } from './dto/create-onboarding.dto';
import { CreateTransportDto } from './dto/create-transport.dto';
import { CreateAmenityDto } from './dto/create-animity.dto';
import { CreateSurroundingDto } from './dto/create-sorrouding.dto';

@Injectable()
export class OnboardingService {
  constructor(private readonly prisma: PrismaService) {}

  private async uploadFile(
    file: Express.Multer.File,
    folder: string,
  ): Promise<string> {
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

  // -------------------- Onboarding --------------------
async createOnboarding(
  userId: string,
  dto: any,
  files?: Express.Multer.File[],
) {
  // 1️ Upload images if any
  const uploadedImages: string[] = [];
  if (files?.length) {
    for (const file of files) {
      const url = await this.uploadFile(file, 'onboarding_images');
      uploadedImages.push(url);
    }
  }

  // 2️ Ensure user exists
  const user = await this.prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new BadRequestException('User not found');

  // 3️ Validate relation IDs exist
  const validAmenities = dto.amenities?.length
    ? await this.prisma.amenity.findMany({
        where: { id: { in: dto.amenities } },
      })
    : [];
  const validTransports = dto.transports?.length
    ? await this.prisma.transportOption.findMany({
        where: { id: { in: dto.transports } },
      })
    : [];
  const validSurroundings = dto.surroundings?.length
    ? await this.prisma.surroundingType.findMany({
        where: { id: { in: dto.surroundings } },
      })
    : [];

  // 4 Set default booleans
  const isMainResidence = dto.isMainResidence ?? false;
  const isTravelWithPets = dto.isTravelWithPets ?? false;
  const isAvailableForExchange = true;

  //  Check if onboarding already exists
  const existing = await this.prisma.onboarding.findUnique({
    where: { userId },
  });
  if (existing) {
    throw new BadRequestException('User already has an onboarding record');
  }

  // 6️ Create onboarding safely
  const onboarding = await this.prisma.onboarding.create({
    data: {
      userId: user.id,
      homeAddress: dto.homeAddress,
      destination: dto.destination,
      ageRange: dto.ageRange,
      maxPeople: dto.maxPeople,
      gender: dto.gender,
      employmentStatus: dto.employmentStatus,
      travelType: dto.travelType,
      favoriteDestinations: Array.isArray(dto.favoriteDestinations)
        ? dto.favoriteDestinations
        : [],
      travelMostlyWith: dto.travelMostlyWith,
      isTravelWithPets,
      notes: dto.notes,
      propertyType: dto.propertyType,
      isMainResidence,
      homeName: dto.homeName,
      homeDescription: dto.homeDescription,
      aboutNeighborhood: dto.aboutNeighborhood,
      homeImages: uploadedImages,
      isAvailableForExchange,
      availabilityStartDate: dto.availabilityStartDate,
      availabilityEndDate: dto.availabilityEndDate,

      // Connect only existing relations
      amenities: { connect: validAmenities.map((a) => ({ id: a.id })) },
      transports: { connect: validTransports.map((t) => ({ id: t.id })) },
      surroundings: { connect: validSurroundings.map((s) => ({ id: s.id })) },
    },
    include: {
      amenities: true,
      transports: true,
      surroundings: true,
    },
  });

  return onboarding;
}

async getAllOnboard(filters?: {
  destination?: string;
  propertyType?: string;
  availabilityStartDate?: string; // ISO string
  maxPeople?: number;
}) {
  const { destination, propertyType, availabilityStartDate, maxPeople } = filters || {};
  console.log('Filters:', filters);

  const andFilters: any[] = [];

  if (destination !== undefined) {
    andFilters.push({ destination: { equals: destination, mode: 'insensitive' } });
  }

  if (propertyType !== undefined) {
    andFilters.push({ propertyType });
  }

  if (availabilityStartDate !== undefined) {
    // Match by exact date (ignore time if needed)
    andFilters.push({
      availabilityStartDate: { equals: new Date(availabilityStartDate) },
    });
  }

  if (maxPeople !== undefined) {
    // Exact match; rows with null will NOT match
    andFilters.push({ maxPeople: maxPeople });
  }

  // If no filters provided, return all rows
  const where = andFilters.length > 0 ? { AND: andFilters } : {};

  return this.prisma.onboarding.findMany({
    where,
    include: {
      amenities: true,
      transports: true,
      surroundings: true,
    },
  });
}



  async getUserOnboarding(userId: string) {
    const onboarding = await this.prisma.onboarding.findUnique({
      where: { userId },
      include: { amenities: true, transports: true, surroundings: true },
    });
    if (!onboarding)
      throw new BadRequestException('User has not completed onboarding');
    return onboarding;
  }

  async deleteOnboard(id: string) {
    console.log(id);
    const res = await this.prisma.onboarding.delete({
      where: {
        id: id,
      },
    });
    return res;
  }

async updateOnboarding(
  userId: string,
  dto: CreateOnboardingDto,
  files?: Express.Multer.File[],
) {
  // 1️⃣ Find existing onboarding
  const existing = await this.prisma.onboarding.findUnique({
    where: { userId },
    include: { amenities: true, transports: true, surroundings: true },
  });

  if (!existing) throw new BadRequestException('Onboarding not found');

  // 2️⃣ Handle image uploads
  const uploadedImages: string[] = existing.homeImages || [];
  if (files?.length) {
    for (const file of files) {
      const url = await this.uploadFile(file, 'onboarding_images');
      uploadedImages.push(url);
    }
  }

  // 3️⃣ Normalize DTO values to arrays
  const onboardedAmenitiesArray = Array.isArray(dto.onboardedAmenities)
    ? dto.onboardedAmenities
    : typeof dto.onboardedAmenities === 'string'
    ? (dto.onboardedAmenities as string).split(',').map((id) => id.trim())
    : [];

  const onboardedTransportsArray = Array.isArray(dto.onboardedTransports)
    ? dto.onboardedTransports
    : typeof dto.onboardedTransports === 'string'
    ? (dto.onboardedTransports as string).split(',').map((id) => id.trim())
    : [];

  const onboardedSurroundingsArray = Array.isArray(dto.onboardedSurroundings)
    ? dto.onboardedSurroundings
    : typeof dto.onboardedSurroundings === 'string'
    ? (dto.onboardedSurroundings as string).split(',').map((id) => id.trim())
    : [];

  // 4️⃣ Validate relations with Prisma
  const validAmenities = onboardedAmenitiesArray.length
    ? await this.prisma.amenity.findMany({
        where: { id: { in: onboardedAmenitiesArray } },
      })
    : [];

  const validTransports = onboardedTransportsArray.length
    ? await this.prisma.transportOption.findMany({
        where: { id: { in: onboardedTransportsArray } },
      })
    : [];

  const validSurroundings = onboardedSurroundingsArray.length
    ? await this.prisma.surroundingType.findMany({
        where: { id: { in: onboardedSurroundingsArray } },
      })
    : [];

  // 5️⃣ Set default booleans
  const isMainResidence = dto.isMainResidence ?? existing.isMainResidence;
  const isTravelWithPets = dto.isTravelWithPets ?? existing.isTravelWithPets;
  const isAvailableForExchange =
    dto.isAvailableForExchange ?? existing.isAvailableForExchange;

  // 6️⃣ Update record
  const updated = await this.prisma.onboarding.update({
    where: { userId },
    data: {
      homeAddress: dto.homeAddress ?? existing.homeAddress,
      destination: dto.destination ?? existing.destination,
      ageRange: dto.ageRange ?? existing.ageRange,
      maxPeople: dto.maxPeople ?? existing.maxPeople,
      gender: dto.gender ?? existing.gender,
      employmentStatus: dto.employmentStatus ?? existing.employmentStatus,
      travelType: (dto.travelType as any) ?? existing.travelType,
      favoriteDestinations: Array.isArray(dto.favoriteDestinations)
        ? dto.favoriteDestinations
        : existing.favoriteDestinations,
      travelMostlyWith: dto.travelMostlyWith ?? existing.travelMostlyWith,
      isTravelWithPets,
      notes: dto.notes ?? existing.notes,
      propertyType: dto.propertyType ?? existing.propertyType,
      isMainResidence,
      homeName: dto.homeName ?? existing.homeName,
      homeDescription: dto.homeDescription ?? existing.homeDescription,
      aboutNeighborhood: dto.aboutNeighborhood ?? existing.aboutNeighborhood,
      homeImages: uploadedImages,
      isAvailableForExchange,
      availabilityStartDate:
        dto.availabilityStartDate ?? existing.availabilityStartDate,
      availabilityEndDate:
        dto.availabilityEndDate ?? existing.availabilityEndDate,

      // ✅ Relations
      amenities: { set: validAmenities.map((a) => ({ id: a.id })) },
      transports: { set: validTransports.map((t) => ({ id: t.id })) },
      surroundings: { set: validSurroundings.map((s) => ({ id: s.id })) },
    },
    include: {
      amenities: true,
      transports: true,
      surroundings: true,
    },
  });

  return updated;
}



  // -------------------- Amenity CRUD --------------------
  async createAmenity(dto: CreateAmenityDto, files?: Express.Multer.File[]) {
    const existing = await this.prisma.amenity.findFirst({
      where: { name: dto.name },
    });
    if (existing) throw new BadRequestException('Amenity exists');

    const iconUrl = files?.[0]
      ? await this.uploadFile(files[0], 'amenity_icons')
      : null;

    return this.prisma.amenity.create({
      data: { name: dto.name, icon: iconUrl },
    });
  }

  async updateAmenity(
    id: string,
    dto: Partial<CreateAmenityDto>,
    files?: Express.Multer.File[],
  ) {
    const amenity = await this.prisma.amenity.findUnique({ where: { id } });
    if (!amenity) throw new BadRequestException('Amenity not found');

    const iconUrl = files?.[0]
      ? await this.uploadFile(files[0], 'amenity_icons')
      : amenity.icon;

    return this.prisma.amenity.update({
      where: { id },
      data: { ...dto, icon: iconUrl },
    });
  }

  async deleteAmenity(id: string) {
    const amenity = await this.prisma.amenity.findUnique({ where: { id } });
    if (!amenity) throw new BadRequestException('Amenity not found');
    return this.prisma.amenity.delete({ where: { id } });
  }

  async getAllAmenities() {
    return this.prisma.amenity.findMany({ orderBy: { name: 'asc' } });
  }

  async getAmenityById(id: string) {
    const amenity = await this.prisma.amenity.findUnique({ where: { id } });
    if (!amenity) throw new BadRequestException('Amenity not found');
    return amenity;
  }

  // -------------------- Transport CRUD --------------------
  async createTransport(
    dto: CreateTransportDto,
    files?: Express.Multer.File[],
  ) {
    const existing = await this.prisma.transportOption.findFirst({
      where: { name: dto.name },
    });
    if (existing) throw new BadRequestException('Transport exists');

    const iconUrl = files?.[0]
      ? await this.uploadFile(files[0], 'transport_icons')
      : null;
    return this.prisma.transportOption.create({
      data: { name: dto.name, icon: iconUrl },
    });
  }

  async updateTransport(
    id: string,
    dto: Partial<CreateTransportDto>,
    files?: Express.Multer.File[],
  ) {
    const transport = await this.prisma.transportOption.findUnique({
      where: { id },
    });
    if (!transport) throw new BadRequestException('Transport not found');

    const iconUrl = files?.[0]
      ? await this.uploadFile(files[0], 'transport_icons')
      : transport.icon;
    return this.prisma.transportOption.update({
      where: { id },
      data: { ...dto, icon: iconUrl },
    });
  }

  async deleteTransport(id: string) {
    const transport = await this.prisma.transportOption.findUnique({
      where: { id },
    });
    if (!transport) throw new BadRequestException('Transport not found');
    return this.prisma.transportOption.delete({ where: { id } });
  }

  async getAllTransports() {
    return this.prisma.transportOption.findMany({ orderBy: { name: 'asc' } });
  }

  async getTransportById(id: string) {
    const transport = await this.prisma.transportOption.findUnique({
      where: { id },
    });
    if (!transport) throw new BadRequestException('Transport not found');
    return transport;
  }

  // -------------------- Surrounding CRUD --------------------
  async createSurrounding(
    dto: CreateSurroundingDto,
    files?: Express.Multer.File[],
  ) {
    const existing = await this.prisma.surroundingType.findFirst({
      where: { name: dto.name },
    });
    if (existing) throw new BadRequestException('Surrounding exists');

    const iconUrl = files?.[0]
      ? await this.uploadFile(files[0], 'surrounding_icons')
      : null;
    return this.prisma.surroundingType.create({
      data: { name: dto.name, icon: iconUrl },
    });
  }

  async updateSurrounding(
    id: string,
    dto: Partial<CreateSurroundingDto>,
    files?: Express.Multer.File[],
  ) {
    const surrounding = await this.prisma.surroundingType.findUnique({
      where: { id },
    });
    if (!surrounding) throw new BadRequestException('Surrounding not found');

    const iconUrl = files?.[0]
      ? await this.uploadFile(files[0], 'surrounding_icons')
      : surrounding.icon;
    return this.prisma.surroundingType.update({
      where: { id },
      data: { ...dto, icon: iconUrl },
    });
  }

  async deleteSurrounding(id: string) {
    const surrounding = await this.prisma.surroundingType.findUnique({
      where: { id },
    });
    if (!surrounding) throw new BadRequestException('Surrounding not found');
    return this.prisma.surroundingType.delete({ where: { id } });
  }

  async getAllSurroundings() {
    return this.prisma.surroundingType.findMany({ orderBy: { name: 'asc' } });
  }

  async getSurroundingById(id: string) {
    const surrounding = await this.prisma.surroundingType.findUnique({
      where: { id },
    });
    if (!surrounding) throw new BadRequestException('Surrounding not found');
    return surrounding;
  }
}
