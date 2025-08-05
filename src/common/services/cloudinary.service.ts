import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import toStream = require('buffer-to-stream');

@Injectable()
export class CloudinaryService {
  async uploadImage(file: Express.Multer.File): Promise<{ secure_url: string }> {
    return new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream({ folder: 'onboarding' }, (error, result) => {
        if (error) return reject(error);
        if (!result) {
  return reject(new Error('Cloudinary upload failed'));
}
        resolve(result);
      });

      toStream(file.buffer).pipe(upload);
    });
  }
}
