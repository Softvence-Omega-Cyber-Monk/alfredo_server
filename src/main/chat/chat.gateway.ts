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

@WebSocketGateway({ cors: { origin: ["http://localhost:5173", "https://vacanzagreece.gr"] } }) // Allow frontend origin
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
    },
    @ConnectedSocket() client: Socket,
  ) {
    // Validate payload
    if (!data.senderId || !data.toUserId || !data.content) {
      client.emit('error', { message: 'Invalid message payload' });
      return;
    }

    try {
      // Save message in the database
      const savedMessage = await this.chatService.saveMessage({
        senderId: data.senderId,
        receiverId: data.toUserId,
        content: data.content,
        exchangeRequestId: data.exchangeRequestId,
      });

      console.log('Message saved:', savedMessage);

      // Emit message to the receiver
      this.server.to(data.toUserId).emit('receive_message', savedMessage);

      // Emit back to sender for confirmation
      client.emit('receive_message', savedMessage);
    } catch (error) {
      console.error('Error saving message:', error);
      client.emit('error', { message: 'Failed to save message' });
    }
  }
}
