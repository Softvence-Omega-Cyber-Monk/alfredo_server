import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ChatMessage } from '@prisma/client';
import { MailService } from '../mail/mail.service';
import { MesageAlertMailTemplatesService } from '../mail/messageAlert';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService,
    private readonly mailService:MailService,
    private readonly MessageAlert:MesageAlertMailTemplatesService
  ) {}

  // Save a message with validation
  async saveMessage(data: {
    senderId: string;
    receiverId: string;
    content: string;
    exchangeRequestId?: string;
  }): Promise<ChatMessage> {
    // Validate sender and receiver
    const senderExists = await this.prisma.user.findUnique({
      where: { id: data.senderId },
    });
    const receiverExists = await this.prisma.user.findUnique({
      where: { id: data.receiverId },
    });

    if (!senderExists || !receiverExists) {
      throw new Error('Sender or receiver does not exist in User table');
    }

    // Validate exchange request if provided
    if (data.exchangeRequestId) {
      const exchangeExists = await this.prisma.exchangeRequest.findUnique({
        where: { id: data.exchangeRequestId },
      });
      if (!exchangeExists) {
        throw new Error(
          `ExchangeRequest with id ${data.exchangeRequestId} does not exist`,
        );
      }
    }
    const mailToRevicer=await this.mailService.sendMail({
      to:receiverExists.email,
      subject:"New Message",
      text:await this.MessageAlert.getUserAlertTemplate(receiverExists.fullName,receiverExists.email)
    })
    return this.prisma.chatMessage.create({
      data: {
        senderId: data.senderId,
        receiverId: data.receiverId,
        content: data.content,
        exchangeRequestId: data.exchangeRequestId ?? null,
      },
    });
  }

  // Fetch all messages for a user
  async getMessagesByUser(userId: string): Promise<ChatMessage[]> {
    return this.prisma.chatMessage.findMany({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async getMessagesBetweenUsers(
    userA: string,
    userB: string,
  ): Promise<ChatMessage[]> {
    return this.prisma.chatMessage.findMany({
      where: {
        OR: [
          { senderId: userA, receiverId: userB },
          { senderId: userB, receiverId: userA },
        ],
      },
      orderBy: { createdAt: 'asc' }, // oldest first
    });
  }
  // Fetch messages for a specific exchange request
  async getMessagesByExchange(
    exchangeRequestId: string,
  ): Promise<ChatMessage[]> {
    return this.prisma.chatMessage.findMany({
      where: { exchangeRequestId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async getChatPartnersWithUser(userId: string) {
    // 1️⃣ Get all messages involving this user
    const messages = await this.prisma.chatMessage.findMany({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
      select: {
        senderId: true,
        receiverId: true,
        content: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // 2️⃣ Extract unique partner IDs
    const partnerIds = new Set<string>();
    messages.forEach((msg) => {
      if (msg.senderId !== userId) partnerIds.add(msg.senderId);
      if (msg.receiverId !== userId) partnerIds.add(msg.receiverId);
    });

    // 3️⃣ Fetch full user info for each partner
    const partners = await this.prisma.user.findMany({
      where: { id: { in: Array.from(partnerIds) } },
      select: {
        id: true,
        fullName: true,
        email: true,
        photo: true,
      },
    });

    // 4️⃣ Include last message with each partner
    const result = partners.map((p) => {
      const lastMessage = messages.find(
        (msg) => msg.senderId === p.id || msg.receiverId === p.id,
      );
      return { ...p, lastMessage };
    });

    return result;
  }
}
