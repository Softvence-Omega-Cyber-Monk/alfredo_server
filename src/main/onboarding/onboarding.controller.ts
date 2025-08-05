// src/onboarding/onboarding.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { OnboardingService } from './onboarding.service';
import { CreateOnboardingDto } from './dto/create-onboarding.dto';
import { User } from '../user/user.decorator'; // custom auth decorator
import { UserPayload } from 'src/common/interfaces/user-payload.interface';


@ApiTags('Onboarding')
@Controller('onboarding')
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('homeImages', 10))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateOnboardingDto })
  async create(
    @UploadedFiles() homeImages: Express.Multer.File[],
    @Body() body: CreateOnboardingDto,
 
  ) {
    return this.onboardingService.create(user.id, body, homeImages);
  }

  @Get(':userId')
  async findByUserId(@Param('userId') userId: string) {
    return this.onboardingService.findByUserId(userId);
  }

  @Delete(':userId')
  async delete(@Param('userId') userId: string) {
    return this.onboardingService.delete(userId);
  }
}
