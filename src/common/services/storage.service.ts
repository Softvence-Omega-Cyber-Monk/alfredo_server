import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

/**
 * `publicId` is the R2 object key. Named this way so the shape matches what the
 * database already stores for Property.images and Badge.iconPublicId, which means
 * no schema change was needed when moving off Cloudinary.
 */
export interface UploadedAsset {
  url: string;
  publicId: string;
}

/** A wrong Content-Type makes browsers download files instead of displaying them. */
const MIME: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.heic': 'image/heic',
  '.heif': 'image/heif',
  '.gif': 'image/gif',
  '.mp4': 'video/mp4',
  '.mov': 'video/quicktime',
  '.webm': 'video/webm',
  '.pdf': 'application/pdf',
};

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);

  private readonly bucket = process.env.R2_BUCKET!;
  private readonly publicUrl = (process.env.R2_PUBLIC_URL ?? '').replace(/\/+$/, '');

  private readonly s3 = new S3Client({
    region: 'auto',
    endpoint:
      process.env.R2_ENDPOINT ??
      `https://${process.env.R2_ACCOUNT_ID}.eu.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });

  private buildKey(folder: string, originalName?: string): string {
    const ext = path.extname(originalName ?? '').toLowerCase();
    return `${folder}/${Date.now()}-${randomUUID()}${ext}`;
  }

  private contentType(key: string, fallback?: string): string {
    return MIME[path.extname(key).toLowerCase()] ?? fallback ?? 'application/octet-stream';
  }

  async uploadBuffer(
    buffer: Buffer,
    folder: string,
    originalName: string,
    mimetype?: string,
  ): Promise<UploadedAsset> {
    const key = this.buildKey(folder, originalName);
    const type = this.contentType(key, mimetype);

    try {
      await this.s3.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: buffer,
          ContentType: type,
          CacheControl: 'public, max-age=31536000, immutable',
          // SVG can carry <script>, which runs if the file is opened directly in a
          // browser tab. Ignored for <img> loads, so rendering is unaffected.
          ...(type === 'image/svg+xml' ? { ContentDisposition: 'attachment' } : {}),
        }),
      );
    } catch (error) {
      this.logger.error(`Failed to upload ${key}`, error as Error);
      throw new BadRequestException('Failed to upload file');
    }

    return { url: `${this.publicUrl}/${key}`, publicId: key };
  }

  /**
   * For call sites using multer diskStorage. Always removes the temp file,
   * including when the upload fails.
   */
  async uploadPath(
    filePath: string,
    folder: string,
    originalName?: string,
    mimetype?: string,
  ): Promise<UploadedAsset> {
    try {
      return await this.uploadBuffer(
        fs.readFileSync(filePath),
        folder,
        originalName ?? path.basename(filePath),
        mimetype,
      );
    } finally {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
  }

  /** Accepts either a memoryStorage (buffer) or diskStorage (path) multer file. */
  async uploadFile(file: Express.Multer.File, folder: string): Promise<UploadedAsset> {
    if (file.buffer) {
      return this.uploadBuffer(file.buffer, folder, file.originalname, file.mimetype);
    }
    return this.uploadPath(file.path, folder, file.originalname, file.mimetype);
  }

  /** Deletion is best-effort: a failure here must not fail the caller's request. */
  async delete(publicId?: string | null): Promise<void> {
    if (!publicId) return;
    try {
      await this.s3.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: publicId }));
    } catch (error) {
      this.logger.error(`Failed to delete ${publicId} from R2`, error as Error);
    }
  }
}
