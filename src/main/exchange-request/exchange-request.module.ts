import { Module } from '@nestjs/common';
import { ExchangeRequestService } from './exchange-request.service';
import { ExchangeRequestController } from './exchange-request.controller';

@Module({
  controllers: [ExchangeRequestController],
  providers: [ExchangeRequestService],
})
export class ExchangeRequestModule {}
