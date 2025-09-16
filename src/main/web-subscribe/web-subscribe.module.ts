import { Module } from '@nestjs/common';
import { WebSubscribeService } from './web-subscribe.service';
import { WebSubscribeController } from './web-subscribe.controller';

@Module({
  controllers: [WebSubscribeController],
  providers: [WebSubscribeService],
})
export class WebSubscribeModule {}
