import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  NotFoundException,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiConsumes,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ArticleService } from './article.service';
import { CreateArticleDto } from './dto/create.article.dto';
import { UpdateArticleDto } from './dto/updateArticle.dto';
import { Article } from '@prisma/client';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from 'src/common/decorators/user.decorator';
import { diskStorage } from 'multer';
import { extname } from 'path';

@ApiTags('Articles')
@Controller('article')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new article' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(
            null,
            `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`,
          );
        },
      }),
    }),
  )
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiBody({
    description: 'Create article with image',
    type: CreateArticleDto,
  })
  async create(
    @User() user: any,
    @UploadedFile() image: Express.Multer.File,
    @Body() createArticleDto: CreateArticleDto,
  ): Promise<Article> {
    try {
      const userId = user.id;
      createArticleDto.userId = userId;

      // ✅ Build public file URL
      const baseUrl = process.env.BASE_URL || 'http://localhost:8000';
      const imagePath = image ? `${baseUrl}/uploads/${image.filename}` : '';

      return await this.articleService.create({
        ...createArticleDto,
        image: imagePath,
      });
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Failed to create article',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all articles' })
  @ApiResponse({ status: 200, description: 'List of articles' })
  async findAll(): Promise<Article[]> {
    try {
      return await this.articleService.findAll();
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Failed to fetch articles',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a single article by ID' })
  @ApiParam({ name: 'id', description: 'Article ID' })
  @ApiResponse({ status: 200, description: 'Article found' })
  @ApiResponse({ status: 404, description: 'Article not found' })
  async findOne(@Param('id') id: string): Promise<Article> {
    try {
      const article = await this.articleService.findOne(id);
      if (!article) {
        throw new NotFoundException(`Article with ID ${id} not found`);
      }
      return article;
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Failed to fetch article',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an article' })
  @ApiParam({ name: 'id', description: 'Article ID' })
  @ApiBody({ type: UpdateArticleDto })
  @ApiResponse({ status: 200, description: 'Article successfully updated' })
  @ApiResponse({ status: 404, description: 'Article not found' })
  async update(
    @Param('id') id: string,
    @Body() updateArticleDto: UpdateArticleDto,
  ): Promise<Article> {
    try {
      const updated = await this.articleService.update(id, updateArticleDto);
      if (!updated) {
        throw new NotFoundException(`Article with ID ${id} not found`);
      }
      return updated;
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Failed to update article',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an article' })
  @ApiParam({ name: 'id', description: 'Article ID' })
  @ApiResponse({ status: 200, description: 'Article successfully deleted' })
  @ApiResponse({ status: 404, description: 'Article not found' })
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    try {
      const deleted = await this.articleService.remove(id);
      if (!deleted) {
        throw new NotFoundException(`Article with ID ${id} not found`);
      }
      return { message: 'Article successfully deleted' };
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Failed to delete article',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
