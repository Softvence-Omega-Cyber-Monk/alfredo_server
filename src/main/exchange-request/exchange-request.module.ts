import { Module } from '@nestjs/common';
import { ExchangeRequestService } from './exchange-request.service';
import { ExchangeRequestController } from './exchange-request.controller';
import { BadgeService } from '../badge/badge.service';
import { NotificationModule } from '../notification/notification.module';
import { BadgeModule } from '../badge/badge.module';

@Module({
  imports: [NotificationModule, BadgeModule],
  controllers: [ExchangeRequestController],
  providers: [ExchangeRequestService],
})
export class ExchangeRequestModule {}
