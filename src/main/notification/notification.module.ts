import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { NotificationGateway } from './notification.gateway';
import { JwtService } from '@nestjs/jwt';
import { DbEventsService } from './db.event.service';

@Module({
  controllers: [NotificationController],
  providers: [NotificationService,NotificationGateway,JwtService,DbEventsService],
  exports:[]
})
export class NotificationModule {}
