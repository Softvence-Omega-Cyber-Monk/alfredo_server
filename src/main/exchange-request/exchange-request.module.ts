import { Module } from '@nestjs/common';
import { ExchangeRequestService } from './exchange-request.service';
import { ExchangeRequestController } from './exchange-request.controller';
import { BadgeService } from '../badge/badge.service';

@Module({
  controllers: [ExchangeRequestController],
  providers: [ExchangeRequestService,BadgeService],
})
export class ExchangeRequestModule {}
