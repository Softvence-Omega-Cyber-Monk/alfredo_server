import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateArticleDto {
  @ApiProperty({
    example: 'My First Article',
    description: 'Title of the article',
  })
  @IsString()
  title: string;

  @ApiProperty({
    example: 'Short description',
    description: 'Description of the article',
  })
  @IsString()
  description: string;

  @ApiProperty({
    example: 'Full content of the article',
    description: 'Main content',
  })
  @IsString()
  content: string;

  @IsString()
  userId: string;

  // 👇 This makes Swagger show a file input
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Article image file',
  })
  image: any;
}

export class Article {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: Date;
  updatedAt: Date;
}
