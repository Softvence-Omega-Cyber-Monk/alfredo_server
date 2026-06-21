import {
  Controller,
  Get,
  Param,
  Post,
  Delete,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { ChatMessage } from '@prisma/client';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiBearerAuth,
  ApiConsumes,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from 'src/common/decorators/user.decorator';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Chat')
@Controller('chat')
export class ChatController {
  constructor(
    private chatService: ChatService,
    private chatGateway: ChatGateway,
  ) {}

  // ==================== EXISTING ENDPOINTS ====================

  // Get all messages for a specific user
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('history/user/:userId')
  @ApiOperation({ summary: 'Get all messages for a user' })
  async getUserChatHistory(@User() user: any): Promise<ChatMessage[]> {
    return this.chatService.getMessagesByUser(user.id);
  }

  // Get messages for a specific exchange request
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('history/exchange/:exchangeRequestId')
  @ApiOperation({ summary: 'Get messages for a specific exchange request' })
  async getExchangeChatHistory(
    @Param('exchangeRequestId') exchangeRequestId: string,
  ): Promise<ChatMessage[]> {
    return this.chatService.getMessagesByExchange(exchangeRequestId);
  }

  // Send a chat message
  @Post('send')
  @ApiOperation({ summary: 'Send a chat message' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        senderId: { type: 'string' },
        receiverId: { type: 'string' },
        content: { type: 'string' },
        exchangeRequestId: { type: 'string', nullable: true },
        attachmentUrl: { type: 'string', nullable: true },
        attachmentType: { type: 'string', nullable: true },
        attachmentName: { type: 'string', nullable: true },
      },
      required: ['senderId', 'receiverId', 'content'],
    },
  })
  async sendMessage(
    @Body()
    body: {
      senderId: string;
      receiverId: string;
      content: string;
      exchangeRequestId?: string;
      attachmentUrl?: string;
      attachmentType?: string;
      attachmentName?: string;
    },
  ): Promise<ChatMessage> {
    const savedMessage = await this.chatService.saveMessage(body);

    // Emit via WebSocket to both sender and receiver
    this.chatGateway.server
      .to(body.receiverId)
      .emit('receive_message', savedMessage);
    this.chatGateway.server
      .to(body.senderId)
      .emit('receive_message', savedMessage);

    return savedMessage;
  }

  // Get all messages between two users
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('history/:userA/:userB')
  @ApiOperation({ summary: 'Get all messages between two users' })
  @ApiParam({ name: 'userA', description: 'User A ID' })
  @ApiParam({ name: 'userB', description: 'User B ID' })
  @ApiResponse({ status: 200, description: 'List of messages' })
  async getMessages(
    @Param('userA') userA: string,
    @Param('userB') userB: string,
  ) {
    return this.chatService.getMessagesBetweenUsers(userA, userB);
  }

  // Get all chat partners for a user
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('partners/:userId')
  async getChatPartners(@User() user: any) {
    return this.chatService.getChatPartnersWithUser(user.id);
  }

  // ==================== BLOCK / UNBLOCK ENDPOINTS ====================

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('block/:targetUserId')
  @ApiOperation({ summary: 'Block a user' })
  @ApiParam({ name: 'targetUserId', description: 'ID of the user to block' })
  @ApiResponse({ status: 201, description: 'User blocked successfully' })
  async blockUser(
    @User() user: any,
    @Param('targetUserId') targetUserId: string,
  ) {
    return this.chatService.blockUser(user.id, targetUserId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete('block/:targetUserId')
  @ApiOperation({ summary: 'Unblock a user' })
  @ApiParam({ name: 'targetUserId', description: 'ID of the user to unblock' })
  @ApiResponse({ status: 200, description: 'User unblocked successfully' })
  async unblockUser(
    @User() user: any,
    @Param('targetUserId') targetUserId: string,
  ) {
    return this.chatService.unblockUser(user.id, targetUserId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('block/list')
  @ApiOperation({ summary: 'Get list of blocked users' })
  @ApiResponse({ status: 200, description: 'List of blocked users' })
  async getBlockedUsers(@User() user: any) {
    return this.chatService.getBlockedUsers(user.id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('block/check/:targetUserId')
  @ApiOperation({ summary: 'Check block status with a user' })
  @ApiParam({ name: 'targetUserId', description: 'ID of the user to check' })
  @ApiResponse({ status: 200, description: 'Block status check result' })
  async checkBlockStatus(
    @User() user: any,
    @Param('targetUserId') targetUserId: string,
  ) {
    return this.chatService.checkBlockStatus(user.id, targetUserId);
  }

  // ==================== DELETE CHAT ENDPOINT ====================

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete('delete/:partnerUserId')
  @ApiOperation({ summary: 'Delete chat with a user (one-sided)' })
  @ApiParam({ name: 'partnerUserId', description: 'ID of the chat partner' })
  @ApiResponse({ status: 200, description: 'Chat deleted successfully' })
  async deleteChat(
    @User() user: any,
    @Param('partnerUserId') partnerUserId: string,
  ) {
    return this.chatService.deleteChat(user.id, partnerUserId);
  }

  // ==================== READ RECEIPTS ENDPOINT ====================

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('mark-read/:senderId')
  @ApiOperation({ summary: 'Mark messages from a sender as read' })
  @ApiParam({ name: 'senderId', description: 'ID of the message sender' })
  @ApiResponse({ status: 200, description: 'Messages marked as read' })
  async markMessagesAsRead(
    @User() user: any,
    @Param('senderId') senderId: string,
  ) {
    return this.chatService.markMessagesAsRead(user.id, senderId);
  }

  // ==================== RECEIVED COUNT ENDPOINT ====================

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('received-count/:fromUserId')
  @ApiOperation({ summary: 'Get count of messages received from a user' })
  @ApiParam({ name: 'fromUserId', description: 'ID of the sender' })
  @ApiResponse({ status: 200, description: 'Message count' })
  async getReceivedMessageCount(
    @User() user: any,
    @Param('fromUserId') fromUserId: string,
  ) {
    const count = await this.chatService.getReceivedMessageCount(
      user.id,
      fromUserId,
    );
    return { count };
  }

  // ==================== FILE UPLOAD ENDPOINT ====================

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('upload')
  @ApiOperation({ summary: 'Upload a chat attachment' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
      fileFilter: (req, file, callback) => {
        const allowedMimes = [
          'image/jpeg',
          'image/png',
          'image/gif',
          'image/webp',
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'text/plain',
        ];
        if (allowedMimes.includes(file.mimetype)) {
          callback(null, true);
        } else {
          callback(
            new BadRequestException('File type not allowed'),
            false,
          );
        }
      },
    }),
  )
  async uploadAttachment(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }
    return this.chatService.uploadAttachment(file);
  }
}
