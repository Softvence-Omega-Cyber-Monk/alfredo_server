import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({ cors: { origin: ["http://localhost:5173", "https://vacanzagreece.gr",'http://localhost:3000'] } }) // Allow frontend origin
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  constructor(private chatService: ChatService) {}

  /** Called when the server is initialized */
  afterInit(server: Server) {
    console.log('Socket server initialized');
    this.server = server; // ensure server reference
  }

  /** Called when a client connects */
  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (!userId) {
      console.log('Client connected without userId, disconnecting');
      client.disconnect(true);
      return;
    }

    console.log(`Client connected: ${userId}`);
    client.join(userId); // Join a room for direct messages
  }

  /** Called when a client disconnects */
  handleDisconnect(client: Socket) {
    const userId = client.handshake.query.userId as string;
    console.log(`Client disconnected: ${userId}`);
  }

  /**
   * Listen for "send_message" events from clients
   * Payload should include senderId, toUserId, content, and optional exchangeRequestId
   */
  @SubscribeMessage('send_message')
  async handleMessage(
    @MessageBody()
    data: {
      senderId: string;
      toUserId: string;
      content: string;
      exchangeRequestId?: string;
      attachmentUrl?: string;
      attachmentType?: string;
      attachmentName?: string;
    },
    @ConnectedSocket() client: Socket,
  ) {
    // Validate payload
    if (!data.senderId || !data.toUserId || !data.content) {
      client.emit('error', { message: 'Invalid message payload' });
      return;
    }

    try {
      // Check if sending is blocked
      const blocked = await this.chatService.isSendBlocked(data.senderId, data.toUserId);
      if (blocked) {
        client.emit('error', {
          type: 'BLOCKED',
          message: 'You have been blocked by this user',
        });
        return;
      }

      // Save message in the database
      const savedMessage = await this.chatService.saveMessage({
        senderId: data.senderId,
        receiverId: data.toUserId,
        content: data.content,
        exchangeRequestId: data.exchangeRequestId,
        attachmentUrl: data.attachmentUrl,
        attachmentType: data.attachmentType,
        attachmentName: data.attachmentName,
      });

      console.log('Message saved:', savedMessage);

      // Emit message to the receiver
      this.server.to(data.toUserId).emit('receive_message', savedMessage);

      // Emit back to sender for confirmation
      client.emit('receive_message', savedMessage);
    } catch (error) {
      console.error('Error saving message:', error);
      if (error.status === 403) {
        client.emit('error', {
          type: 'BLOCKED',
          message: error.message || 'You have been blocked by this user',
        });
      } else {
        client.emit('error', { message: 'Failed to save message' });
      }
    }
  }

  /**
   * Listen for "mark_read" events from clients
   * When a user opens a chat, mark all messages from the other user as read
   */
  @SubscribeMessage('mark_read')
  async handleMarkRead(
    @MessageBody()
    data: {
      userId: string;     // The user who is reading (current user)
      senderId: string;   // The user whose messages are being read
    },
    @ConnectedSocket() client: Socket,
  ) {
    if (!data.userId || !data.senderId) {
      client.emit('error', { message: 'Invalid mark_read payload' });
      return;
    }

    try {
      const result = await this.chatService.markMessagesAsRead(
        data.userId,
        data.senderId,
      );

      if (result.count > 0) {
        // Notify the sender that their messages have been read
        this.server.to(data.senderId).emit('message_read', {
          readBy: data.userId,
          messageIds: result.messageIds,
        });

        // Also notify the reader for local UI update
        client.emit('message_read', {
          readBy: data.userId,
          messageIds: result.messageIds,
        });
      }
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }
}
