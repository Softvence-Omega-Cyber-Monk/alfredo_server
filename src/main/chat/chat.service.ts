import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';


@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async saveMessage(data: {
    senderId: string;
    receiverId: string;
    content: string;
    exchangeRequestId: string;
  }) {
    return await this.prisma.chatMessage.create({
      data,
    });
  }

  async getMessages(exchangeRequestId: string) {
    return await this.prisma.chatMessage.findMany({
      where: { exchangeRequestId },
      orderBy: { createdAt: 'asc' },
    });
  }
}
