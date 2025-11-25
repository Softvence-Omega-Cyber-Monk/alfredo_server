import { Injectable, OnModuleInit } from '@nestjs/common';
import { NotificationGateway } from './notification.gateway';
import { PrismaService } from '../prisma/prisma.service';
import { Client } from 'pg';

@Injectable()
export class DbEventsService implements OnModuleInit {
  private pgClient: Client;

  constructor(
    private gateway: NotificationGateway,
    private prisma: PrismaService,
  ) {}

  async onModuleInit() {
    this.pgClient = new Client({
      connectionString: process.env.DATABASE_URL,
    });

    await this.pgClient.connect();

    // Listen to PostgreSQL NOTIFY channel
    this.pgClient.on('notification', async (msg) => {
      if (msg.channel === 'new_notification') {
        const payload = JSON.parse(msg.payload);

        // Send real-time notification to the user
        this.gateway.sendToUser(payload.userId, payload);
      }
    });

    // Subscribe to channel
    await this.pgClient.query('LISTEN new_notification');
  }
}
