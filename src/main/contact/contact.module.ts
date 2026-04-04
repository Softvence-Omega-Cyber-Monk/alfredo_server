import { Module } from '@nestjs/common';
import { ContactController } from './contact.controller';
import { ContactService } from './contact.service';
import { PrismaModule } from '../prisma/prisma.module';
import { MailService } from '../mail/mail.service';

@Module({
  imports: [PrismaModule],
  controllers: [ContactController],
  providers: [ContactService, MailService],
})
export class ContactModule {}
