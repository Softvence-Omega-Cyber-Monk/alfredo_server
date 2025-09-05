import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  UseGuards,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
  ApiConsumes,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BadgeService } from './badge.service';
import { CreateBadgeDto } from './dto/create-badge.dto';
import { UpdateBadgeDto } from './dto/update-badge.dto';
import { BadgeType } from '@prisma/client';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Role } from '../auth/authorization/roleEnum';
import { RolesGuard } from '../auth/authorization/roles.guard';
import { Roles } from '../auth/authorization/roles.decorator';

@ApiTags('Badges')
@Controller('badges')
export class BadgeController {
  constructor(private readonly badgeService: BadgeService) {}

  /** CREATE BADGE */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(Role.Admin, Role.SuperAdmin)
  @Post()
  @ApiOperation({ summary: 'Create a new badge (Admin only)' })
  @UseInterceptors(
  FileInterceptor('icon', {
    storage: diskStorage({
      destination: './uploads', // temporary folder
      filename: (req, file, cb) => {
        const name = file.originalname.split('.')[0];
        const fileExtName = extname(file.originalname);
        cb(null, `${name}-${Date.now()}${fileExtName}`);
      },
    }),
  }),
)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Badge creation payload (file upload included)',
    schema: {
      type: 'object',
      properties: {
        type: { type: 'string', enum: Object.values(BadgeType),example: 'REVIEW_BADGE'  },
        displayName: { type: 'string',example: 'Review Badge',  },
        description: { type: 'string',example: 'Awarded to users when their property receives 100 reviews.'  },
        icon: { type: 'string', format: 'binary' }, // file upload
      },
      required: ['type', 'displayName', 'icon'],
    },
  })
  @ApiResponse({ status: 201, description: 'Badge created successfully' })
  @ApiResponse({ status: 400, description: 'Badge type already exists or validation failed' })
  async create(@Body() dto: CreateBadgeDto, @UploadedFile() file: Express.Multer.File) {
    if (file) {
      const uploaded = await this.badgeService.uploadFile(file, 'badges');
      dto.icon = uploaded.url;
      dto.iconPublicId = uploaded.publicId;
    }
    return this.badgeService.create(dto);
  }

  /** UPDATE BADGE */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(Role.Admin,Role.SuperAdmin)
  @Patch(':id')
  @ApiOperation({ summary: 'Update an existing badge (Admin only)' })
 @UseInterceptors(
  FileInterceptor('icon', {
    storage: diskStorage({
      destination: './uploads', // temporary folder
      filename: (req, file, cb) => {
        const name = file.originalname.split('.')[0];
        const fileExtName = extname(file.originalname);
        cb(null, `${name}-${Date.now()}${fileExtName}`);
      },
    }),
  }),
)
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'id', description: 'Badge ID to update' })
  @ApiBody({
    description: 'Badge update payload (file upload optional)',
    schema: {
      type: 'object',
      properties: {
        type: { type: 'string', enum: Object.values(BadgeType) },
        displayName: { type: 'string' },
        description: { type: 'string' },
        icon: { type: 'string', format: 'binary' }, 
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Badge updated successfully' })
  @ApiResponse({ status: 404, description: 'Badge not found' })
  @ApiResponse({ status: 400, description: 'Badge type already exists or validation failed' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateBadgeDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (file) {
      const uploaded = await this.badgeService.uploadFile(file, 'badges');
      dto.icon = uploaded.url;
      dto.iconPublicId = uploaded.publicId;
    }
    return this.badgeService.update(id, dto);
  }

  /** DELETE BADGE */
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(Role.Admin,Role.SuperAdmin)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a badge (Admin only)' })
  @ApiParam({ name: 'id', description: 'Badge ID to delete' })
  @ApiResponse({ status: 200, description: 'Badge deleted successfully' })
  @ApiResponse({ status: 404, description: 'Badge not found' })
  async remove(@Param('id') id: string) {
    return this.badgeService.remove(id);
  }

  /** GET ALL BADGES */
  @Get()
  @ApiOperation({ summary: 'Get all available badges' })
  @ApiResponse({ status: 200, description: 'List of all badges' })
  async findAll() {
    return this.badgeService.findAll();
  }

  /** GET USER BADGES */
  @Get('user/:userId')
  @ApiOperation({ summary: 'Get all badges awarded to a specific user' })
  @ApiParam({ name: 'userId', description: 'User ID to retrieve badges for' })
  @ApiResponse({ status: 200, description: 'List of badges owned by the user' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findByUser(@Param('userId') userId: string) {
    return this.badgeService.findByUser(userId);
  }
}
