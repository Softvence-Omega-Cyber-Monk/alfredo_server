import { Controller, Post, Body, Get, Param, InternalServerErrorException } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationService } from './notification.service';

@ApiTags('Notification')
@Controller('notification')
export class NotificationController {
  constructor(private readonly service: NotificationService) {}

  @Post('send')
  create(@Body() body: CreateNotificationDto) {
    return this.service.createNotification(
      body.userId,
      body.title,
      body.message,
    );
  }

  @Get('user/:userId')
  async getUserNotifications(@Param('userId') userId: string) {
   try{
     const res=await this.service.getUserNotifications(userId);
    return {
      status:200,
      message:"success",
      data:res
    }
   }catch(error){
    throw new InternalServerErrorException(error.message,error.status)
   }
  }

  @Get('unread-count/:userId')
  unreadCount(@Param('userId') userId: string) {
    return this.service.countUnread(userId);
  }

  @Post('read/:id')
  read(@Param('id') id: string) {
    return this.service.markAsRead(id);
  }

  @Post('read-all/:userId')
  readAll(@Param('userId') userId: string) {
    return this.service.markAllAsRead(userId);
  }
}
