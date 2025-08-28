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
import { FileFieldsInterceptor, FilesInterceptor } from '@nestjs/platform-express';
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
      parsedDto = JSON.parse(data);
    } catch (error) {
      throw new Error('Invalid JSON in data field');
    }
    console.log(user)
    console.log(parsedDto);
    console.log(files);
    return this.onboardingService.createOnboarding(user.id, parsedDto, files);
  }

   @Get()
@ApiOperation({ summary: 'Get all onboardings with optional filters' })
@ApiQuery({ name: 'destination', required: false, type: String })
@ApiQuery({ name: 'propertyType', required: false, type: String })
@ApiQuery({ name: 'availabilityStartDate', required: false, type: String, description: 'ISO date string' })
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

  @Put(':userId')
  @ApiOperation({ summary: 'Update onboarding for a user' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Onboarding data with optional images',
    type: CreateOnboardingDto,
  })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'homeImages', maxCount: 10 },
    ]),
  )
  async updateOnboarding(
    @Param('userId') userId: string,
    @Body() dto: CreateOnboardingDto,
    @UploadedFiles() files?: { homeImages?: Express.Multer.File[] },
  ) {
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

  // ------------------ Amenities ------------------
  @Post('amenities')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
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
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
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
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch('amenities/:id')
  async updateAmenity(@Param('id') id: string, @Body() dto: CreateAmenityDto) {
    const res = await this.onboardingService.updateAmenity(id, dto);
    return {
      status: HttpStatus.OK,
      success: true,
      message: 'Amenity Updated',
      data: res,
    };
  }
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
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
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
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
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch('transports/:id')
  async updateTransport(
    @Param('id') id: string,
    @Body() dto: CreateTransportDto,
  ) {
    const res = await this.onboardingService.updateTransport(id, dto);
    return {
      status: HttpStatus.OK,
      success: true,
      message: 'Transport Updated',
      data: res,
    };
  }
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
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
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('surroundings')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
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
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
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
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch('surroundings/:id')
  async updateSurrounding(
    @Param('id') id: string,
    @Body() dto: CreateSurroundingDto,
  ) {
    const res = await this.onboardingService.updateSurrounding(id, dto);
    return {
      status: HttpStatus.OK,
      success: true,
      message: 'Surrounding Updated',
      data: res,
    };
  }
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
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
