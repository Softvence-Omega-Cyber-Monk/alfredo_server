import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { ChatController } from './chat.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [ChatService, ChatGateway, PrismaService],
  controllers: [ChatController],
  exports: [ChatGateway],
})
export class ChatModule {}
