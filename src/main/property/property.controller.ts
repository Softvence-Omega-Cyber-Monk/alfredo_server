import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFiles,
  UseGuards,
  HttpException,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { PropertyService } from './property.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiConsumes,
  ApiParam,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from 'src/common/decorators/user.decorator';

@ApiTags('Property')
@Controller('property')
export class PropertyController {
  constructor(private readonly ProperService: PropertyService) {}

  /** CREATE PROPERTY WITH FILES */
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(
    FilesInterceptor('files', 5, {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          cb(null, `${Date.now()}-${file.originalname}`);
        },
      }),
    }),
  )
  @ApiOperation({ summary: 'Create a new property with multiple images' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'string',
          description: `JSON string of property details. Example:
\`\`\`json
{
  "title": "Cozy Apartment in Athens",
  "description": "2-bedroom apartment near the Acropolis",
  "location": "Athens, Greece",
  "country": "Greece",
  "price": 1200,
  "size": 75,
  "bedrooms": 2,
  "bathrooms": 1,
  "propertyType": "HOME",
  "maxPeople": 5,
  "isTravelWithPets": false,
  "availabilityStartDate": "2025-09-15",
  "availabilityEndDate": "2025-12-31",
  "amenities": ["amenityId1", "amenityId2"],
  "transports": ["transportId1"],
  "surroundings": ["surroundingId1", "surroundingId2"]
}
\`\`\``,
        },
        files: {
          type: 'array',
          description: 'Up to 5 property images',
          items: { type: 'string', format: 'binary' },
        },
      },
    },
  })
  async createProperty(
    @Body('data') data: string,
    @User() user: any,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    let parsedDto;
    try {
      parsedDto = JSON.parse(data);
    } catch (error) {
      throw new Error('Invalid JSON in data field');
    }
    parsedDto.ownerId = user.id;
    parsedDto.files = files; // ✅ Pass files to service

    return this.ProperService.createProperty(parsedDto);
  }

  /** GET ALL PROPERTIES */

@Get()
@ApiOperation({ summary: 'Get all properties with filters, search & pagination' })
@ApiQuery({ name: 'search', required: false, description: 'Search by title, location, or country' })
@ApiQuery({ name: 'location', required: false, description: 'Filter by location' })
@ApiQuery({ name: 'country', required: false, description: 'Filter by country' })
@ApiQuery({ name: 'maxPeople', required: false, description: 'Filter by minimum number of people' })
@ApiQuery({ name: 'propertyType', required: false, enum: ['HOME', 'APARTMENT'], description: 'Filter by property type' })
@ApiQuery({ name: 'amenities', required: false, description: 'Comma-separated list of amenity IDs' })
@ApiQuery({ name: 'transports', required: false, description: 'Comma-separated list of transport IDs' })
@ApiQuery({ name: 'page', required: false, description: 'Page number for pagination (default: 1)' })
@ApiQuery({ name: 'limit', required: false, description: 'Items per page for pagination (default: 10)' })
@ApiQuery({ name: 'availabilityStartDate', required: false, description: 'Filter by available start date (YYYY-MM-DD)' })
@ApiQuery({ name: 'availabilityEndDate', required: false, description: 'Filter by available end date (YYYY-MM-DD)' })
@ApiQuery({
  name: 'isTravelWithPets',
  required: false,
  type: Boolean,
  description: 'Filter properties that allow traveling with pets',
})
async getAllProperty(
  @Query('search') search?: string,
  @Query('location') location?: string,
  @Query('country') country?: string,
  @Query('maxPeople') maxPeople?: number,
  @Query('propertyType') propertyType?: string,
  @Query('availabilityStartDate') availabilityStartDate?: string,
  @Query('availabilityEndDate') availabilityEndDate?: string,
  @Query('isTravelWithPets') isTravelWithPets?: string,
  @Query('amenities') amenities?: string,
  @Query('transports') transports?: string,
  @Query('page') page?: number,
  @Query('limit') limit?: number,
) {
  return this.ProperService.getAllProperty({
    search,
    location,
    country,
    maxPeople: maxPeople ? Number(maxPeople) : undefined,
    propertyType,
  availabilityStartDate: availabilityStartDate ? new Date(availabilityStartDate) : undefined,
    availabilityEndDate: availabilityEndDate ? new Date(availabilityEndDate) : undefined,
    isTravelWithPets: isTravelWithPets !== undefined ? isTravelWithPets === 'true' : undefined,
    amenities: amenities ? amenities.split(',') : undefined,
    transports: transports ? transports.split(',') : undefined,
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
  });
}


  /** GET USER PROPERTIES */
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('my-properties')
  @ApiOperation({ summary: 'Get all properties by user ID (from JWT)' })
  async getAllPropertyByUser(@User() user: any): Promise<any> {
    return this.ProperService.getPropertiesByUserId(user.id);
  }

  /** GET PROPERTY BY ID */
  @Get(':id')
  @ApiOperation({ summary: 'Get property by ID' })
  @ApiParam({ name: 'id', description: 'Property ID' })
  async getPropertyById(@Param('id') id: string) {
    return this.ProperService.getPropertyById(id);
  }

  /** UPDATE PROPERTY */
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @UseInterceptors(
    FilesInterceptor('files', 5, {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          cb(null, `${Date.now()}-${file.originalname}`);
        },
      }),
    }),
  )
  @ApiOperation({ summary: 'Update a property by ID' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'id', description: 'Property ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'string',
          description: `JSON string of updated property fields. Example:
\`\`\`json
{
  "title": "Updated Apartment Title",
  "price": 1300,
  "amenities": ["amenityId1"],
  "transports": ["transportId2"],
   "propertyType": "APARTMENT",
  "maxPeople": 4,
  "isTravelWithPets": true,
  "availabilityStartDate": "2025-09-15",
  "availabilityEndDate": "2025-12-31",
  "surroundings": ["surroundingId3"],
  "removeImages": ["cloudinaryPublicId1", "cloudinaryPublicId2"]
}
\`\`\`
- \`removeImages\`: array of Cloudinary public IDs that should be deleted.`,
        },
        files: {
          type: 'array',
          description: 'Optional new images to add',
          items: { type: 'string', format: 'binary' },
        },
      },
    },
  })
  async updateProperty(
    @Param('id') id: string,
    @Body('data') data: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    let parsedDto;
    try {
      parsedDto = JSON.parse(data);
    } catch (error) {
      throw new Error('Invalid JSON in data field');
    }

    parsedDto.files = files; // ✅ Pass files to service

    return this.ProperService.updateProperty(id, parsedDto);
  }

  /** DELETE PROPERTY */
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a property by ID' })
  @ApiParam({ name: 'id', description: 'Property ID' })
  async deleteProperty(@Param('id') id: string) {
    return this.ProperService.deleteProperty(id);
  }

  /** FAVORITES */
  @Post('favorite')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Add a property to favorites' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        propertyId: {
          type: 'string',
          description: 'ID of the property to favorite',
        },
      },
      required: ['propertyId'],
    },
  })
  async favoriteProperty(@User() user: any, @Body() body: any) {
    const userId = user.id;
    const propertyId = body.propertyId;
    try {
      const res = await this.ProperService.favoriteProperty(userId, propertyId);
      return {
        success: true,
        status: 200,
        message: 'Property favorited successfully',
        data: res,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_GATEWAY);
    }
  }

  /** Delete property from favorites */
  @Delete('favorite/:propertyId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Remove a property from favorites' })
  @ApiParam({
    name: 'propertyId',
    description: 'ID of the property to remove from favorites',
  })
  async deleteFavorite(
    @User() user: any,
    @Param('propertyId') propertyId: string,
  ) {
    const userId = user.id;
    try {
      const res = await this.ProperService.deleteFavorite(userId, propertyId);
      return {
        success: true,
        status: 200,
        message: 'Favorite deleted successfully',
        data: res,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_GATEWAY);
    }
  }

  /** Get all favorites of the logged-in user */
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('/user/favorite')
  @ApiOperation({
    summary: 'Get all favorite properties of the logged-in user',
  })
  async getUserFavorites(@User() user: any) {
    const userId = user.id;
    try {
      const res = await this.ProperService.getUserFavorites(userId);
      return {
        success: true,
        status: 200,
        message: 'Favorites fetched successfully',
        data: res,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_GATEWAY);
    }
  }
}
