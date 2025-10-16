import { Module } from '@nestjs/common';
import { PropertyService } from './property.service';
import { PropertyController } from './property.controller';
import { BadgeService } from '../badge/badge.service';

@Module({
  controllers: [PropertyController],
  providers: [PropertyService,BadgeService],
})
export class PropertyModule {}
