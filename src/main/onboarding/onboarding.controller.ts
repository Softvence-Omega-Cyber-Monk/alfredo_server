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
  Query,
  Put,
  BadRequestException,
} from '@nestjs/common';
import {
  FileFieldsInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from 'src/common/decorators/user.decorator';
import { OnboardingService } from './onboarding.service';
import { CreateOnboardingDto } from './dto/create-onboarding.dto';
import { CreateAmenityDto } from './dto/create-animity.dto';
import { CreateTransportDto } from './dto/create-transport.dto';
import { CreateSurroundingDto } from './dto/create-sorrouding.dto';
import { get } from 'http';
import { RolesGuard } from '../auth/authorization/roles.guard';
import { Roles } from '../auth/authorization/roles.decorator';
import { Role } from '../auth/authorization/roleEnum';

@ApiTags('Onboarding')
@Controller('onboarding')
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  // ------------------ Onboarding ------------------
  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FilesInterceptor('homeImages', 30, {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          cb(null, `${Date.now()}-${file.originalname}`);
        },
      }),
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'string',
          description: 'JSON string of property details',
        },
        homeImages: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
      },
    },
  })
  @ApiConsumes('multipart/form-data')
  async createOnboarding(
    @User() user: any,
    @Body('data') data: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    let parsedDto;
    try {
      parsedDto = typeof data === 'string' ? JSON.parse(data) : data;
    } catch (error) {
      throw new BadRequestException('Invalid JSON in data field');
    }
    // console.log('User:', user);
    // console.log('Parsed DTO:', parsedDto);
    // console.log('Files:', files);
    try {
      return await this.onboardingService.createOnboarding(user.id, parsedDto, files);
    } catch (error) {
      console.error('Onboarding creation error:', error);
      throw error;
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all onboardings with optional filters' })
  @ApiQuery({ name: 'destination', required: false, type: String })
  @ApiQuery({ name: 'propertyType', required: false, type: String })
  @ApiQuery({
    name: 'availabilityStartDate',
    required: false,
    type: String,
    description: 'ISO date string',
  })
  @ApiQuery({ name: 'maxPeople', required: false, type: Number })
  async getAllOnboard(
    @Query('destination') destination?: string,
    @Query('propertyType') propertyType?: string,
    @Query('availabilityStartDate') availabilityStartDate?: string,
    @Query('maxPeople') maxPeople?: string,
  ) {
    const parsedMaxPeople = maxPeople ? parseInt(maxPeople, 10) : undefined;

    const filters = {
      destination,
      propertyType,
      availabilityStartDate,
      maxPeople: parsedMaxPeople,
    };

    const res = await this.onboardingService.getAllOnboard(filters);

    return {
      status: HttpStatus.OK,
      success: true,
      message: 'All Onboards',
      data: res,
    };
  }

  @Get('user')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async getOnboardByUser(@User() user: any) {
    const id = user.id;
    const res = await this.onboardingService.getUserOnboarding(id);
    return {
      status: HttpStatus.OK,
      success: true,
      message: 'Onboarding Deleted',
      data: res,
    };
  }
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete('onboard/:id')
  async deleteOnboard(@Param('id') id: string) {
    console.log(id);
    const res = await this.onboardingService.deleteOnboard(id);
    return {
      status: HttpStatus.OK,
      success: true,
      message: 'Onboarding Deleted',
      data: res,
    };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put()
  @ApiOperation({ summary: 'Update onboarding for a user' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Onboarding data with optional images',
    type: CreateOnboardingDto,
  })
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'homeImages', maxCount: 10 }]),
  )
  async updateOnboarding(
    @User() user: any,
    @Body() dto: CreateOnboardingDto,
    @UploadedFiles() files?: { homeImages?: Express.Multer.File[] },
  ) {
    const userId = user.id;
    if (!userId) throw new BadRequestException('UserId is required');

    const updated = await this.onboardingService.updateOnboarding(
      userId,
      dto,
      files?.homeImages,
    );

    return {
      status: HttpStatus.OK,
      success: true,
      message: 'Onboarding updated successfully',
      data: updated,
    };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete('gallery-image')
  @ApiOperation({ summary: 'Delete a specific image from the onboarding gallery' })
  async deleteGalleryImage(
    @User() user: any,
    @Body('imageUrl') imageUrl: string,
  ) {
    if (!imageUrl) throw new BadRequestException('imageUrl is required');
    const updated = await this.onboardingService.deleteGalleryImage(user.id, imageUrl);
    return {
      status: HttpStatus.OK,
      success: true,
      message: 'Image deleted successfully',
      data: updated,
    };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('gallery')
  @ApiOperation({ summary: 'Upload new images to the onboarding gallery' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FilesInterceptor('homeImages', 10, {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          cb(null, `${Date.now()}-${file.originalname}`);
        },
      }),
    }),
  )
  async uploadGalleryImages(
    @User() user: any,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (!files || files.length === 0) throw new BadRequestException('No files uploaded');
    const updated = await this.onboardingService.uploadGalleryImages(user.id, files);
    return {
      status: HttpStatus.OK,
      success: true,
      message: 'Images uploaded successfully',
      data: updated,
    };
  }

  // ------------------ Amenities ------------------
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(Role.Admin,Role.SuperAdmin)
  @Post('amenities')
  @UseInterceptors(
    FilesInterceptor('icon', 1, {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) =>
          cb(null, `${Date.now()}-${file.originalname}`),
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

  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(Role.Admin,Role.SuperAdmin)
  @Patch('amenities/:id')
  @UseInterceptors(
    FilesInterceptor('icon', 1, {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) =>
          cb(null, `${Date.now()}-${file.originalname}`),
      }),
    }),
  )
  @ApiConsumes('multipart/form-data')
  async updateAmenity(
    @Param('id') id: string,
    @Body() dto: CreateAmenityDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const res = await this.onboardingService.updateAmenity(id, dto, files);
    return {
      status: HttpStatus.OK,
      success: true,
      message: 'Amenity Updated',
      data: res,
    };
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(Role.Admin,Role.SuperAdmin)
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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(Role.Admin,Role.SuperAdmin)
  @Post('transports')
  @UseInterceptors(
    FilesInterceptor('icon', 1, {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) =>
          cb(null, `${Date.now()}-${file.originalname}`),
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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(Role.Admin,Role.SuperAdmin)
  @Patch('transports/:id')
  @UseInterceptors(
    FilesInterceptor('icon', 1, {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) =>
          cb(null, `${Date.now()}-${file.originalname}`),
      }),
    }),
  )
  @ApiConsumes('multipart/form-data')
  async updateTransport(
    @Param('id') id: string,
    @Body() dto: CreateTransportDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const res = await this.onboardingService.updateTransport(id, dto, files);
    return {
      status: HttpStatus.OK,
      success: true,
      message: 'Transport Updated',
      data: res,
    };
  }
   @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(Role.Admin,Role.SuperAdmin)
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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(Role.Admin,Role.SuperAdmin)
  @Post('surroundings')
  @UseInterceptors(
    FilesInterceptor('icon', 1, {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) =>
          cb(null, `${Date.now()}-${file.originalname}`),
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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(Role.Admin,Role.SuperAdmin)
  @Patch('surroundings/:id')
  @UseInterceptors(
    FilesInterceptor('icon', 1, {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) =>
          cb(null, `${Date.now()}-${file.originalname}`),
      }),
    }),
  )
  @ApiConsumes('multipart/form-data')
  async updateSurrounding(
    @Param('id') id: string,
    @Body() dto: CreateSurroundingDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const res = await this.onboardingService.updateSurrounding(id, dto, files);
    return {
      status: HttpStatus.OK,
      success: true,
      message: 'Surrounding Updated',
      data: res,
    };
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(Role.Admin,Role.SuperAdmin)
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
