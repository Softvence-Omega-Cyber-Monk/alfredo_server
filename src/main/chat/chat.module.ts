import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { ChatController } from './chat.controller';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { MesageAlertMailTemplatesService } from '../mail/messageAlert';

@Module({
  providers: [ChatService, 
     ChatGateway,
     PrismaService,
     MailService,
     MesageAlertMailTemplatesService
    ],
  controllers: [ChatController],
  exports: [ChatGateway],
})
export class ChatModule {}
