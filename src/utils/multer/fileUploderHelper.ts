import { Injectable, InternalServerErrorException } from '@nestjs/common';
import {
  writeFileSync,
  existsSync,
  mkdirSync,
  copyFileSync,
  unlinkSync,
} from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import * as mime from 'mime-types';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FileUploadService {
  constructor(private readonly configService: ConfigService) {}

  async processUploadedFile(file: Express.Multer.File, caption?: string) {
    try {
      const fileId = uuidv4();
      const fileExt = file.originalname.includes('.')
        ? file.originalname.substring(file.originalname.lastIndexOf('.'))
        : '';
      const filename = `${fileId}${fileExt}`;

      const mimeType =
        file.mimetype ||
        mime.lookup(file.originalname) ||
        'application/octet-stream';
      const fileType = mimeType.split('/')[0] || 'unknown';

      const uploadDir = join(process.cwd(), 'uploads');
      if (!existsSync(uploadDir)) mkdirSync(uploadDir, { recursive: true });

      const filePath = join(uploadDir, filename);

      // Save file into uploads folder
      if (file.path) {
        // If file was stored temporarily on disk by Multer
        copyFileSync(file.path, filePath);
        unlinkSync(file.path); // ✅ Remove temp file
      } else if (file.buffer) {
        // If file was kept in memory by Multer
        writeFileSync(filePath, file.buffer);
      }

      // Generate accessible URL
      const baseUrl = this.configService.getOrThrow('BASE_URL');
      const fileUrl = `${baseUrl}/files/${filename}`;

      return {
        filename,
        filePath,
        fileUrl,
        fileType,
        mimeType,
        size: file.size,
        caption,
      };
    } catch (error) {
      console.error('Error processing uploaded file:', error);
      throw new InternalServerErrorException('Failed to process uploaded file');
    }
  }
}
