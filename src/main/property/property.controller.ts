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
} from '@nestjs/common';
import { PropertyService } from './property.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBody, ApiConsumes, ApiParam } from '@nestjs/swagger';

@ApiTags('Property')
@Controller('property')
export class PropertyController {
  constructor(private readonly ProperService: PropertyService) {}

  /** CREATE PROPERTY WITH FILES */
  @Post()
  @UseInterceptors(FilesInterceptor('files'))
  @ApiOperation({ summary: 'Create a new property with multiple images' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        data: { type: 'string', description: 'JSON string of property details' },
        files: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
      },
    },
  })
  async createProperty(
    @Body('data') data: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    let parsedDto;
    try {
      parsedDto = JSON.parse(data);
    } catch (error) {
      throw new Error('Invalid JSON in data field');
    }

    // TODO: Handle file URLs if needed, e.g., upload to cloud storage
    const res = await this.ProperService.createProperty(parsedDto);
    return res;
  }

  /** GET ALL PROPERTIES */
  @Get()
  @ApiOperation({ summary: 'Get all properties' })
  async getAllProperty() {
    return this.ProperService.getAllProperty();
  }

  /** GET PROPERTY BY ID */
  @Get(':id')
  @ApiOperation({ summary: 'Get property by ID' })
  @ApiParam({ name: 'id', description: 'Property ID' })
  async getPropertyById(@Param('id') id: string) {
    return this.ProperService.getPropertyById(id);
  }

  /** UPDATE PROPERTY */
  @Patch(':id')
  @UseInterceptors(FilesInterceptor('files'))
  @ApiOperation({ summary: 'Update a property by ID' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'id', description: 'Property ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        data: { type: 'string', description: 'JSON string of updated property fields' },
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
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a property by ID' })
  @ApiParam({ name: 'id', description: 'Property ID' })
  async deleteProperty(@Param('id') id: string) {
    return this.ProperService.deleteProperty(id);
  }
}
