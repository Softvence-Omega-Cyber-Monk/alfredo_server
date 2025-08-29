// property.controller.ts
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
          description: 'JSON string of property details',
        },
        files: {
          type: 'array',
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
    const userId = user.id;
    parsedDto.ownerId = userId;
    // TODO: Handle file URLs if needed, e.g., upload to cloud storage
    const res = await this.ProperService.createProperty(parsedDto);
    return res;
  }

  /** GET ALL PROPERTIES */
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ summary: 'Get all properties' })
  async getAllProperty() {
    return this.ProperService.getAllProperty();
  }
@ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('my-properties')
  @ApiOperation({ summary: 'Get all properties by user ID (from JWT)' })
  async getAllPropertyByUser(@User() userId: string): Promise<any> {
    return this.ProperService.getPropertiesByUserId(userId);
  }


  /** GET PROPERTY BY ID */
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
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
  @UseInterceptors(FilesInterceptor('files'))
  @ApiOperation({ summary: 'Update a property by ID' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'id', description: 'Property ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'string',
          description: 'JSON string of updated property fields',
        },
        files: {
          type: 'array',
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

    // TODO: Handle file URLs if needed
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

   @Post('favorite')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Add a property to favorites' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        propertyId: { type: 'string', description: 'ID of the property to favorite' },
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
  @ApiParam({ name: 'propertyId', description: 'ID of the property to remove from favorites' })
  async deleteFavorite(@User() user: any, @Param('propertyId') propertyId: string) {
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
  @ApiOperation({ summary: 'Get all favorite properties of the logged-in user' })
  async getUserFavorites(@User() user: any) {
    const userId = user.id;
    console.log(userId);
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
