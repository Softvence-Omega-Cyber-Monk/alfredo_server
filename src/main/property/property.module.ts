import { Module } from '@nestjs/common';
import { PropertyService } from './property.service';
import { PropertyController } from './property.controller';
import { BadgeService } from '../badge/badge.service';
import { StorageService } from 'src/common/services/storage.service';

@Module({
  controllers: [PropertyController],
  providers: [PropertyService,BadgeService, StorageService],
})
export class PropertyModule {}
