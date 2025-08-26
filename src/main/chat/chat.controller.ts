import { Controller, Get, Param, Post, Body, UseGuards } from '@nestjs/common';
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
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Chat')
@Controller('chat')
export class ChatController {
  constructor(
    private chatService: ChatService,
    private chatGateway: ChatGateway,
  ) {}
  // Get all messages for a specific user
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('history/user/:userId')
  @ApiOperation({ summary: 'Get all messages for a user' })
  async getUserChatHistory(
    @Param('userId') userId: string,
  ): Promise<ChatMessage[]> {
    return this.chatService.getMessagesByUser(userId);
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
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
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
  @ApiOperation({ summary: 'Get all chat partners for a user' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  async getChatPartners(@Param('userId') userId: string) {
    return this.chatService.getChatPartnersWithUser(userId);
  }
}
