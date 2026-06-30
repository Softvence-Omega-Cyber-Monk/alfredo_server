import { Injectable, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ChatMessage } from '@prisma/client';
import { MailService } from '../mail/mail.service';
import { MesageAlertMailTemplatesService } from '../mail/messageAlert';
import { NotificationService } from '../notification/notification.service';
import { cloudinary } from 'src/config/cloudinary.config';
import * as streamifier from 'streamifier';
import { ReportUserDto } from './dto/report-user.dto';

@Injectable()
export class ChatService {
  constructor(
    private prisma: PrismaService,
    private readonly mailService: MailService,
    private readonly MessageAlert: MesageAlertMailTemplatesService,
    private readonly notification: NotificationService
  ) {}

  // ==================== BLOCK / UNBLOCK ====================

  async blockUser(blockerId: string, blockedId: string) {
    if (blockerId === blockedId) {
      throw new BadRequestException('You cannot block yourself');
    }

    // Check if already blocked
    const existing = await this.prisma.blockedUser.findUnique({
      where: {
        blockerId_blockedId: { blockerId, blockedId },
      },
    });

    if (existing) {
      throw new BadRequestException('User is already blocked');
    }

    return this.prisma.blockedUser.create({
      data: { blockerId, blockedId },
    });
  }

  async unblockUser(blockerId: string, blockedId: string) {
    const existing = await this.prisma.blockedUser.findUnique({
      where: {
        blockerId_blockedId: { blockerId, blockedId },
      },
    });

    if (!existing) {
      throw new BadRequestException('User is not blocked');
    }

    return this.prisma.blockedUser.delete({
      where: {
        blockerId_blockedId: { blockerId, blockedId },
      },
    });
  }

  async getBlockedUsers(userId: string) {
    const blocked = await this.prisma.blockedUser.findMany({
      where: { blockerId: userId },
      include: {
        blocked: {
          select: {
            id: true,
            fullName: true,
            photo: true,
          },
        },
      },
    });

    return blocked.map((b) => ({
      id: b.id,
      blockedId: b.blockedId,
      fullName: b.blocked.fullName,
      photo: b.blocked.photo,
      createdAt: b.createdAt,
    }));
  }

  async checkBlockStatus(userId: string, targetUserId: string) {
    const [blockedByMe, blockedByThem] = await Promise.all([
      this.prisma.blockedUser.findUnique({
        where: {
          blockerId_blockedId: { blockerId: userId, blockedId: targetUserId },
        },
      }),
      this.prisma.blockedUser.findUnique({
        where: {
          blockerId_blockedId: { blockerId: targetUserId, blockedId: userId },
        },
      }),
    ]);

    return {
      blockedByMe: !!blockedByMe,
      blockedByThem: !!blockedByThem,
    };
  }

  /**
   * Check if sending is blocked in either direction.
   * The sender cannot send if the receiver has blocked them.
   */
  async isSendBlocked(senderId: string, receiverId: string): Promise<boolean> {
    const block = await this.prisma.blockedUser.findUnique({
      where: {
        blockerId_blockedId: { blockerId: receiverId, blockedId: senderId },
      },
    });
    return !!block;
  }

  // ==================== DELETE CHAT ====================

  async deleteChat(userId: string, partnerUserId: string) {
    // Upsert — if already deleted, update the deletedAt timestamp
    return this.prisma.deletedChat.upsert({
      where: {
        userId_partnerUserId: { userId, partnerUserId },
      },
      update: {
        deletedAt: new Date(),
      },
      create: {
        userId,
        partnerUserId,
      },
    });
  }

  // ==================== MESSAGE METHODS ====================

  // Save a message with validation and block check
  async saveMessage(data: {
    senderId: string;
    receiverId: string;
    content: string;
    exchangeRequestId?: string;
    attachmentUrl?: string;
    attachmentType?: string;
    attachmentName?: string;
  }): Promise<ChatMessage> {
    // Check if sending is blocked
    const blocked = await this.isSendBlocked(data.senderId, data.receiverId);
    if (blocked) {
      throw new ForbiddenException('You have been blocked by this user');
    }

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

    // Save message
    const message = await this.prisma.chatMessage.create({
      data: {
        senderId: data.senderId,
        receiverId: data.receiverId,
        content: data.content,
        exchangeRequestId: data.exchangeRequestId ?? null,
        attachmentUrl: data.attachmentUrl ?? null,
        attachmentType: data.attachmentType ?? null,
        attachmentName: data.attachmentName ?? null,
        status: 'SENT',
      },
    });

    // Send Mail alert
    await this.mailService.sendMail({
      to: receiverExists.email,
      subject: "New Message",
      html: await this.MessageAlert.getUserAlertTemplate(receiverExists.fullName, receiverExists.email)
    });

    // Send real-time notification
    await this.notification.createNotification(
      data.receiverId,
      `New message from ${senderExists.fullName}`,
      data.content.length > 50 ? data.content.substring(0, 50) + "..." : data.content
    );

    // If the partner had previously deleted the chat, remove the DeletedChat record
    // so the conversation re-appears for them
    await this.prisma.deletedChat.deleteMany({
      where: {
        userId: data.receiverId,
        partnerUserId: data.senderId,
      },
    });

    return message;
  }

  // Fetch all messages for a user — excluding deleted chats
  async getMessagesByUser(userId: string): Promise<ChatMessage[]> {
    // Get list of deleted chat partners
    const deletedChats = await this.prisma.deletedChat.findMany({
      where: { userId },
      select: { partnerUserId: true, deletedAt: true },
    });

    const deletedPartnerMap = new Map(
      deletedChats.map((dc) => [dc.partnerUserId, dc.deletedAt]),
    );

    const messages = await this.prisma.chatMessage.findMany({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
      orderBy: { createdAt: 'asc' },
    });

    // Filter out messages from deleted chats (only messages before deletedAt)
    if (deletedPartnerMap.size === 0) return messages;

    return messages.filter((msg) => {
      const partnerId = msg.senderId === userId ? msg.receiverId : msg.senderId;
      const deletedAt = deletedPartnerMap.get(partnerId);
      if (!deletedAt) return true; // not deleted
      return msg.createdAt > deletedAt; // only show messages after re-start
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
    // Get deleted chats for this user
    const deletedChats = await this.prisma.deletedChat.findMany({
      where: { userId },
      select: { partnerUserId: true },
    });
    const deletedPartnerIds = new Set(deletedChats.map((dc) => dc.partnerUserId));

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

    // 2️⃣ Extract unique partner IDs, excluding deleted ones
    const partnerIds = new Set<string>();
    messages.forEach((msg) => {
      if (msg.senderId !== userId) partnerIds.add(msg.senderId);
      if (msg.receiverId !== userId) partnerIds.add(msg.receiverId);
    });

    // Remove deleted chat partners
    deletedPartnerIds.forEach((id) => partnerIds.delete(id));

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

  // ==================== READ RECEIPTS ====================

  async markMessagesAsRead(userId: string, senderId: string) {
    const updated = await this.prisma.chatMessage.updateMany({
      where: {
        senderId: senderId,
        receiverId: userId,
        status: 'SENT',
      },
      data: {
        status: 'READ',
      },
    });

    // Return the IDs of messages that were marked as read
    if (updated.count > 0) {
      const readMessages = await this.prisma.chatMessage.findMany({
        where: {
          senderId: senderId,
          receiverId: userId,
          status: 'READ',
        },
        select: { id: true },
        orderBy: { createdAt: 'desc' },
        take: updated.count,
      });

      return {
        count: updated.count,
        messageIds: readMessages.map((m) => m.id),
      };
    }

    return { count: 0, messageIds: [] };
  }

  // ==================== RECEIVED MESSAGE COUNT ====================

  async getReceivedMessageCount(userId: string, fromUserId: string): Promise<number> {
    return this.prisma.chatMessage.count({
      where: {
        senderId: fromUserId,
        receiverId: userId,
      },
    });
  }

  // ==================== FILE UPLOAD ====================

  async uploadAttachment(file: Express.Multer.File): Promise<{
    url: string;
    type: string;
    name: string;
    size: number;
  }> {
    const mimeType = file.mimetype || 'application/octet-stream';
    let fileType: string;
    let resourceType: string;

    if (mimeType.startsWith('image/')) {
      fileType = 'image';
      resourceType = 'image';
    } else if (mimeType.startsWith('video/')) {
      fileType = 'video';
      resourceType = 'video';
    } else {
      fileType = 'file';
      resourceType = 'raw';
    }

    // Upload to Cloudinary
    const result = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'chat-attachments',
          resource_type: resourceType as any,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        },
      );
      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });

    return {
      url: result.secure_url,
      type: fileType,
      name: file.originalname,
      size: file.size,
    };
  }

  // ==================== REPORT USER ====================

  async reportUser(reporterId: string, targetId: string, dto: ReportUserDto) {
    const reporter = await this.prisma.user.findUnique({
      where: { id: reporterId },
    });
    const target = await this.prisma.user.findUnique({
      where: { id: targetId },
    });

    if (!target) {
      throw new BadRequestException('Reported user not found');
    }

    const emailHtml = `
      <h2>New User Report Submitted</h2>
      <p><strong>Reporter:</strong> ${reporter?.fullName || 'Unknown'} (${reporter?.email || 'N/A'}) [ID: ${reporterId}]</p>
      <p><strong>Reported User:</strong> ${target.fullName} (${target.email}) [ID: ${targetId}]</p>
      <p><strong>Reason:</strong> ${dto.reason}</p>
      ${dto.details ? `<p><strong>Additional Details:</strong><br/>${dto.details}</p>` : ''}
      <p><strong>Time:</strong> ${new Date().toISOString()}</p>
    `;

    await this.mailService.sendMail({
      to: 'info@vacanzagreece.gr',
      subject: `User Report: ${target.fullName} reported for ${dto.reason}`,
      html: emailHtml,
    });

    return { message: 'Report submitted successfully' };
  }
}
