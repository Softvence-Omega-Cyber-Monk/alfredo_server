import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateArticleDto } from './dto/create.article.dto';
import { UpdateArticleDto } from './dto/updateArticle.dto';

@Injectable()
export class ArticleService {
  constructor(private prisma: PrismaService) {}

  /** Create a new article */
  async create(createArticleDto: any) {
    return this.prisma.article.create({
      data: createArticleDto,
    });
  }

  /** Get all articles */
  async findAll() {
    return this.prisma.article.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /** Get a single article by ID */
  async findOne(id: string) {
    const article = await this.prisma.article.findUnique({
      where: { id },
    });
    if (!article) {
      throw new NotFoundException(`Article with ID ${id} not found`);
    }
    return article;
  }

  /** Update an article */
  async update(id: string, updateArticleDto: UpdateArticleDto) {
    // Check if article exists
    const existing = await this.prisma.article.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Article with ID ${id} not found`);
    }

    return this.prisma.article.update({
      where: { id },
      data: updateArticleDto,
    });
  }

  /** Delete an article */
  async remove(id: string) {
    const existing = await this.prisma.article.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Article with ID ${id} not found`);
    }

    await this.prisma.article.delete({ where: { id } });
    return { message: 'Article successfully deleted' };
  }
}
