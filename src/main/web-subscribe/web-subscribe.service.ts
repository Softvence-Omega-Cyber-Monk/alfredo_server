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
  const response = await this.prisma.web_subscribe.create({
    data: createWebSubscribeDto,
  });

  // Build dynamic HTML email template
  const htmlTemplate = `
    <div style="font-family: Arial, sans-serif; background-color: #f9fafb; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); padding: 20px;">
        <h2 style="color: #ff6b00; text-align: center;">📬 New Subscriber Alert</h2>
        <p style="font-size: 16px; color: #333;">Hello Admin,</p>
        <p style="font-size: 15px; color: #333;">
          Someone just subscribed to your platform.
        </p>
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
          <tr>
            <td style="font-weight: bold; padding: 8px; border-bottom: 1px solid #ddd;">Subscriber Email:</td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${createWebSubscribeDto.email}</td>
          </tr>
          ${
            createWebSubscribeDto.email
              ? `
          <tr>
            <td style="font-weight: bold; padding: 8px; border-bottom: 1px solid #ddd;">Name:</td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${createWebSubscribeDto.email}</td>
          </tr>
          `
              : ''
          }
        </table>

        <p style="margin-top: 20px; font-size: 14px; color: #555;">
          You can check this subscriber in your dashboard for more details.
        </p>

        <p style="margin-top: 30px; font-size: 12px; color: #999; text-align: center;">
          © ${new Date().getFullYear()} Your Platform. All rights reserved.
        </p>
      </div>
    </div>
  `;

  // Send email to owner
  await this.mailService.sendMail({
    to: process.env.SUBSCRIBE_EMAIl as string,
    subject: `${createWebSubscribeDto.email} just subscribed to your platform`,
    html: htmlTemplate,
  });

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
