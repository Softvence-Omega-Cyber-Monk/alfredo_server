import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { ChatController } from './chat.controller';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { MesageAlertMailTemplatesService } from '../mail/messageAlert';
import { NotificationModule } from '../notification/notification.module';
import { ConfigModule } from '@nestjs/config';
import { StorageService } from 'src/common/services/storage.service';

@Module({
  imports: [NotificationModule, ConfigModule],
  providers: [ChatService,
     ChatGateway,
     PrismaService,
     MailService,
     MesageAlertMailTemplatesService,
     StorageService
    ],
  controllers: [ChatController],
  exports: [ChatGateway, ChatService],
})
export class ChatModule {}
