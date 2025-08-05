import { Controller, Post, Body, Get, Param, Patch, Delete, UseGuards } from '@nestjs/common';
import { OnboardingService } from './onboarding.service';
import { AuthGuard } from '@nestjs/passport'; // Assuming JWT authentication
import { CreateOnboardingDto, UpdateOnboardingDto } from './dto/create-onboarding.dto';

@Controller('onboarding')
@UseGuards(AuthGuard('jwt')) // Assuming JWT authentication is used
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Post()
  create(@Body() createOnboardingDto: CreateOnboardingDto) {
    return this.onboardingService.createOnboarding(createOnboardingDto);
  }

  @Get(':userId')
  getOnboarding(@Param('userId') userId: string) {
    return this.onboardingService.getOnboardingByUserId(userId);
  }

  @Patch(':userId')
  update(@Param('userId') userId: string, @Body() updateOnboardingDto: UpdateOnboardingDto) {
    return this.onboardingService.updateOnboarding(userId, updateOnboardingDto);
  }

  @Delete(':userId')
  delete(@Param('userId') userId: string) {
    return this.onboardingService.deleteOnboarding(userId);
  }
}