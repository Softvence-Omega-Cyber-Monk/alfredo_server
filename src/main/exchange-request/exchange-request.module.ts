import { Module } from '@nestjs/common';
import { ExchangeRequestService } from './exchange-request.service';
import { ExchangeRequestController } from './exchange-request.controller';
import { BadgeService } from '../badge/badge.service';
import { NotificationService } from '../notification/notification.service';
import { NotificationGateway } from '../notification/notification.gateway';

@Module({
  controllers: [ExchangeRequestController],
  providers: [ExchangeRequestService,BadgeService,NotificationService,NotificationGateway],
})
export class ExchangeRequestModule {}
