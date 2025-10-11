// session-cleanup.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from 'src/main/prisma/prisma.service';


@Injectable()
export class SessionCleanupService {
  private readonly logger = new Logger(SessionCleanupService.name);
  private readonly INACTIVITY_DAYS = 7;

  constructor(private prisma: PrismaService) {}

  // Run this task daily at 2:00 AM
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT) 
  async cleanupExpiredSessions() {
    this.logger.log('Starting expired session cleanup...');

    const cutOffDate = new Date();
    // Calculate the date 7 days ago
    cutOffDate.setDate(cutOffDate.getDate() - this.INACTIVITY_DAYS); 

    try {
      const result = await this.prisma.activeSession.deleteMany({
        where: {
          lastActivity: {
            lt: cutOffDate,
          },
        },
      });

      this.logger.log(`Cleanup complete. Deleted ${result.count} inactive sessions.`);
    } catch (error) {
      this.logger.error('Error during session cleanup:', error.message, error.stack);
    }
  }
}