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

@WebSocketGateway({
  cors: {
    origin: '*', // Set frontend origin in production
  },
})
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(private chatService: ChatService) {}

  afterInit(server: Server) {
    console.log('Socket server initialized');
  }

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId;
    console.log(`Client connected: ${userId}`);
  }

  handleDisconnect(client: Socket) {
    const userId = client.handshake.query.userId;
    console.log(`Client disconnected: ${userId}`);
  }

  @SubscribeMessage('send_message')
  async handleMessage(
    @MessageBody() data: { content: string; toUserId: string; exchangeRequestId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const fromUserId = client.handshake.query.userId as string;

    // Save message to DB
    const savedMessage = await this.chatService.saveMessage({
      senderId: fromUserId,
      receiverId: data.toUserId,
      content: data.content,
      exchangeRequestId: data.exchangeRequestId,
    });

    // Emit to receiver
    this.server.to(data.toUserId).emit('receive_message', savedMessage);
  }
}
