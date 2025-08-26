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

@WebSocketGateway({ cors: { origin: '*' } }) // Allow frontend origin in production
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(private chatService: ChatService) {}

  // Called when server is initialized
  afterInit(server: Server) {
    console.log('Socket server initialized');
    this.server = server; // ensure server reference
  }

  // Called on client connection
  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (!userId) {
      console.log('Client connected without userId');
      client.disconnect(true);
      return;
    }

    console.log(`Client connected: ${userId}`);
    client.join(userId); // Join a room for direct messages
  }

  // Called on client disconnect
  handleDisconnect(client: Socket) {
    const userId = client.handshake.query.userId as string;
    console.log(`Client disconnected: ${userId}`);
  }

  // Listen for "send_message" events from clients
  @SubscribeMessage('send_message')
  async handleMessage(
    @MessageBody() data: { content: string; toUserId: string; exchangeRequestId?: string },
    @ConnectedSocket() client: Socket,
  ) {
    const fromUserId = client.handshake.query.userId as string;

    // Save message in DB with validation
    const savedMessage = await this.chatService.saveMessage({
      senderId: fromUserId,
      receiverId: data.toUserId,
      content: data.content,
      exchangeRequestId: data.exchangeRequestId,
    });

    console.log('savedMessage:', savedMessage);

    // Emit message to receiver
    this.server.to(data.toUserId).emit('receive_message', savedMessage);

    // Emit back to sender for confirmation
    client.emit('receive_message', savedMessage);
  }
}
