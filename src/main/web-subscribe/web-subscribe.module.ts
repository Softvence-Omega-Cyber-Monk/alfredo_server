import { Module } from '@nestjs/common';
import { WebSubscribeService } from './web-subscribe.service';
import { WebSubscribeController } from './web-subscribe.controller';
import { PromotionalMailTemplatesService } from '../mail/promotional.mail';
import { PromotionalMailService } from '../mail/another.mail.setup';
import { MailService } from '../mail/mail.service';


@Module({
  controllers: [WebSubscribeController],
  providers: [WebSubscribeService,PromotionalMailTemplatesService,PromotionalMailService,MailService],
})
export class WebSubscribeModule {}
