import { Controller, Post, Get, Patch, Delete, UseGuards, UseInterceptors, UploadedFiles, Request, Body } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { OnboardingService } from './onboarding.service';

import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { DestinationType } from '@prisma/client';
import { CreateOnboardingDto, UpdateOnboardingDto } from './dto/create-onboarding.dto';

@ApiTags('onboarding')
@Controller('onboarding')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Post()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('homeImages', 10)) // Max 10 images
  @ApiBody({ type: CreateOnboardingDto })
  create(@Request() req, @UploadedFiles() files: Express.Multer.File[], @Body() body: any) {
    const createOnboardingDto: CreateOnboardingDto = {
      ...body,
      homeImages: files,
      travelType: typeof body.travelType === 'string' ? JSON.parse(body.travelType) : body.travelType || [],
      favoriteDestinations: typeof body.favoriteDestinations === 'string' ? JSON.parse(body.favoriteDestinations) : body.favoriteDestinations || [],
      amenityIds: typeof body.amenityIds === 'string' ? JSON.parse(body.amenityIds) : body.amenityIds || [],
      transportIds: typeof body.transportIds === 'string' ? JSON.parse(body.transportIds) : body.transportIds || [],
      surroundingIds: typeof body.surroundingIds === 'string' ? JSON.parse(body.surroundingIds) : body.surroundingIds || [],
      isTravelWithPets: typeof body.isTravelWithPets === 'string' ? body.isTravelWithPets === 'true' : !!body.isTravelWithPets,
      isAvailableForExchange: typeof body.isAvailableForExchange === 'string' ? body.isAvailableForExchange === 'true' : !!body.isAvailableForExchange,
    };
    return this.onboardingService.createOnboarding(req.user.userId, createOnboardingDto);
  }

  @Get()
  getOnboarding(@Request() req) {
    return this.onboardingService.getOnboardingByUserId(req.user.userId);
  }

  @Patch()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('homeImages', 10)) // Max 10 images
  @ApiBody({ type: UpdateOnboardingDto })
  update(@Request() req, @UploadedFiles() files: Express.Multer.File[], @Body() body: any) {
    const updateOnboardingDto: UpdateOnboardingDto = {
      ...body,
      homeImages: files,
      travelType: typeof body.travelType === 'string' ? JSON.parse(body.travelType) : body.travelType,
      favoriteDestinations: typeof body.favoriteDestinations === 'string' ? JSON.parse(body.favoriteDestinations) : body.favoriteDestinations,
      amenityIds: typeof body.amenityIds === 'string' ? JSON.parse(body.amenityIds) : body.amenityIds,
      transportIds: typeof body.transportIds === 'string' ? JSON.parse(body.transportIds) : body.transportIds,
      surroundingIds: typeof body.surroundingIds === 'string' ? JSON.parse(body.surroundingIds) : body.surroundingIds,
      isTravelWithPets: typeof body.isTravelWithPets === 'string' ? body.isTravelWithPets === 'true' : body.isTravelWithPets !== undefined ? !!body.isTravelWithPets : undefined,
      isAvailableForExchange: typeof body.isAvailableForExchange === 'string' ? body.isAvailableForExchange === 'true' : body.isAvailableForExchange !== undefined ? !!body.isAvailableForExchange : undefined,
    };
    return this.onboardingService.updateOnboarding(req.user.userId, updateOnboardingDto);
  }

  @Delete()
  delete(@Request() req) {
    return this.onboardingService.deleteOnboarding(req.user.userId);
  }
}