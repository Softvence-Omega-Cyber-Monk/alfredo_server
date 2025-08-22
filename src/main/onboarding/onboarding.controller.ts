import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  UploadedFiles,
  UseInterceptors,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from 'src/common/decorators/user.decorator';
import { OnboardingService } from './onboarding.service';
import { CreateOnboardingDto } from './dto/create-onboarding.dto';
import { CreateAmenityDto } from './dto/create-animity.dto';
import { CreateTransportDto } from './dto/create-transport.dto';
import { CreateSurroundingDto } from './dto/create-sorrouding.dto';

@ApiTags('Onboarding')
@Controller('onboarding')
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  // ------------------ Onboarding ------------------
  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FilesInterceptor('homeImages', 5, {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          cb(null, `${Date.now()}-${file.originalname}`);
        },
      }),
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateOnboardingDto })
  async createOnboarding(
    @User() user: any,
    @Body() dto: CreateOnboardingDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.onboardingService.createOnboarding(user.id, dto, files);
  }

  @Get()
  async getAllOnboard() {
    const res = await this.onboardingService.getAllOnboard();
    return {
      status: HttpStatus.OK,
      success: true,
      message: 'All Onboards',
      data: res,
    };
  }

  // ------------------ Amenities ------------------
  @Post('amenities')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FilesInterceptor('icon', 1, {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
      }),
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateAmenityDto })
  async createAmenity(
    @User() user: any,
    @Body() dto: CreateAmenityDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.onboardingService.createAmenity(dto, files);
  }

  @Get('amenities')
  async getAllAmenities() {
    const res = await this.onboardingService.getAllAmenities();
    return {
      status: HttpStatus.OK,
      success: true,
      message: 'All Amenities',
      data: res,
    };
  }

  @Patch('amenities/:id')
  async updateAmenity(
    @Param('id') id: string,
    @Body() dto: CreateAmenityDto,
  ) {
    const res = await this.onboardingService.updateAmenity(id, dto);
    return {
      status: HttpStatus.OK,
      success: true,
      message: 'Amenity Updated',
      data: res,
    };
  }

  @Delete('amenities/:id')
  async deleteAmenity(@Param('id') id: string) {
    const res = await this.onboardingService.deleteAmenity(id);
    return {
      status: HttpStatus.OK,
      success: true,
      message: 'Amenity Deleted',
      data: res,
    };
  }

  // ------------------ Transports ------------------
  @Post('transports')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FilesInterceptor('icon', 1, {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
      }),
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateTransportDto })
  async createTransport(
    @User() user: any,
    @Body() dto: CreateTransportDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.onboardingService.createTransport(dto, files);
  }

  @Get('transports')
  async getAllTransports() {
    const res = await this.onboardingService.getAllTransports();
    return {
      status: HttpStatus.OK,
      success: true,
      message: 'All Transports',
      data: res,
    };
  }

  @Patch('transports/:id')
  async updateTransport(@Param('id') id: string, @Body() dto: CreateTransportDto) {
    const res = await this.onboardingService.updateTransport(id, dto);
    return {
      status: HttpStatus.OK,
      success: true,
      message: 'Transport Updated',
      data: res,
    };
  }

  @Delete('transports/:id')
  async deleteTransport(@Param('id') id: string) {
    const res = await this.onboardingService.deleteTransport(id);
    return {
      status: HttpStatus.OK,
      success: true,
      message: 'Transport Deleted',
      data: res,
    };
  }

  // ------------------ Surroundings ------------------
  @Post('surroundings')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FilesInterceptor('icon', 1, {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
      }),
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateSurroundingDto })
  async createSurrounding(
    @User() user: any,
    @Body() dto: CreateSurroundingDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.onboardingService.createSurrounding(dto, files);
  }

  @Get('surroundings')
  async getAllSurroundings() {
    const res = await this.onboardingService.getAllSurroundings();
    return {
      status: HttpStatus.OK,
      success: true,
      message: 'All Surroundings',
      data: res,
    };
  }

  @Patch('surroundings/:id')
  async updateSurrounding(@Param('id') id: string, @Body() dto: CreateSurroundingDto) {
    const res = await this.onboardingService.updateSurrounding(id, dto);
    return {
      status: HttpStatus.OK,
      success: true,
      message: 'Surrounding Updated',
      data: res,
    };
  }

  @Delete('surroundings/:id')
  async deleteSurrounding(@Param('id') id: string) {
    const res = await this.onboardingService.deleteSurrounding(id);
    return {
      status: HttpStatus.OK,
      success: true,
      message: 'Surrounding Deleted',
      data: res,
    };
  }
}
