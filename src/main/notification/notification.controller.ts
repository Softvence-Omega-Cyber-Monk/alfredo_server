import { Controller, Post, Body, Get, Param, InternalServerErrorException, UseGuards, Req, HttpStatus, Delete } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from 'src/common/guard/jwt.guard';
import { Message } from 'twilio/lib/twiml/MessagingResponse';

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

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
  @Get('user')
  async getUserNotifications(@Req() req:any) {
   try{
    const userId=req.user.userId
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

  @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
  @Get('unread-count')
  async unreadCount(@Req() req:any) {
   try{
     const userId=req.user.userId
    const res=await this.service.countUnread(userId);
    return {
      status:HttpStatus.OK,
      Message:"Unread notifications count fetched successfully",
      data:res
    }
   }catch(error){
    throw new InternalServerErrorException(error.message, error.status)
   }
  }


  @Post('read/:id')
  read(@Param('id') id: string) {
    try{
      return this.service.markAsRead(id);
    }catch(error){
      throw new InternalServerErrorException(error.message,error.status)
    }
  }

  @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
  @Post('read-all')
  async readAll(@Req() req:any) {
   try{
     const userId=req.user.userId
    const res=await this.service.markAllAsRead(userId);
    return {
      status:HttpStatus.OK,
      Message:"All notifications marked as read",
      data:res
    }
   }catch(error){
    throw new InternalServerErrorException(error.message,error.status)
   }
  }

  @Delete('delete/:id')
  async deleteNotification(@Param('id') id: string) {
    try{
      const res=await this.service.deleteNotification(id);
      return {
        status:HttpStatus.OK,
        Message:"Notification deleted successfully",
        data:res
      }
    }catch(error){
      throw new InternalServerErrorException(error.message,error.status)
    }
  }


  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete('delete-myAllNotification')
  async deleteMyAllNotification(@Req() req:any) {
    try{
      const id=req.user.userId
      const res=await this.service.deleteNotification(id);
      return {
        status:HttpStatus.OK,
        Message:"Notification deleted successfully",
        data:res
      }
    }catch(error){
      throw new InternalServerErrorException(error.message,error.status)
    }
  }
}
