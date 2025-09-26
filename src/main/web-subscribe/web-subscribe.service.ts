import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CreateWebSubscribeDto } from './dto/create-web-subscribe.dto';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { PromotionalMailTemplatesService } from '../mail/promotional.mail';
import { PromotionalMailService } from '../mail/another.mail.setup';


@Injectable()
export class WebSubscribeService {
  private readonly logger = new Logger(WebSubscribeService.name)
  constructor(private prisma:PrismaService,private mailService:MailService,private promotion:PromotionalMailTemplatesService,private promotionalMial:PromotionalMailService){}
  async create(createWebSubscribeDto: CreateWebSubscribeDto) {
    const response = await this.prisma.web_subscribe.create({data:createWebSubscribeDto})
    return response;
  }

  findAll() {
   const response= this.prisma.web_subscribe.findMany();
   return response;
  }


  async sendPromotionalMail(subject: string, message: string) {
    try {
      // 1. Fetch all newsletter subscribers from the database
      const subscribers = await this.prisma.web_subscribe.findMany({
        select: {
          email: true,
        },
      });

      const recipientEmails = subscribers.map((subscriber) => subscriber.email);
      if (recipientEmails.length === 0) {
        this.logger.warn('No subscribers found. Promotional email was not sent.');
        return { message: 'No subscribers found.' };
      }
      const html=await this.promotion.getInvitationTemplate(subject, message)
      await this.promotionalMial.sendMail({
        to: recipientEmails,
        subject,
        html,
      });

      this.logger.log(`Promotional email sent to ${recipientEmails.length} subscribers.`);
      return { message: 'Promotional email sent successfully.' };

    } catch (error) {
      this.logger.error(`Failed to send promotional email: ${error.message}`, error.stack);
      throw new HttpException('Failed to send promotional email.', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
