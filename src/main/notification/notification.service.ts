import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationGateway } from './notification.gateway';

@Injectable()
export class NotificationService {
  constructor(
    private prisma: PrismaService,
    private gateway: NotificationGateway
  ) {}

  // Create + emit notification
  async createNotification(userId: string, title: string, message: string) {
    const noti = await this.prisma.notification.create({
      data: { userId, title, message }
    });

    // Send via socket
    this.gateway.sendToUser(userId, noti);

    return noti;
  }

  // Get all notifications of user
  async getUserNotifications(userId: string) {
    const res=await this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
    const total=await this.prisma.notification.count({
      where: { userId,isRead:false },
    })
    return{
      unreadCount:total,
      notifications:res
      
    }
  }

  // Count unread notifications
  async countUnread(userId: string) {
    return this.prisma.notification.count({
      where: { userId, isRead: false }
    });
  }

  // Mark single as read
  async markAsRead(notificationId: string) {
    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true }
    });
  }

  // Mark all as read
  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true }
    });
  }


  async deleteNotification(id:string){
    const isExist=await this.prisma.notification.findUnique({where:{id}})
    if(!isExist){
      throw new Error('Notification not found')
    }
    const res=await this.prisma.notification.delete({where:{id}})
    return res
  }

  async deleteMyAllNotification(userId:string){
    const isExist=await this.prisma.notification.findMany({where:{userId}})
    if(!isExist){
      throw new Error('Notification not found')
    }
    const res=await this.prisma.notification.deleteMany({where:{userId}})
    return res
  }
}
