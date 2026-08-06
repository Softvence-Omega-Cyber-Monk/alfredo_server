import { Module } from '@nestjs/common';
import { BadgeService } from './badge.service';
import { BadgeController } from './badge.controller';
import { StorageService } from 'src/common/services/storage.service';

@Module({
  controllers: [BadgeController],
  providers: [BadgeService, StorageService],
  exports: [BadgeService],
})
export class BadgeModule {}
