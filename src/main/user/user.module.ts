import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaService } from '../prisma/prisma.service';
import { BadgeService } from '../badge/badge.service';

@Module({
  controllers: [UserController],
  providers: [UserService, PrismaService,BadgeService],
  exports: [UserService],
})
export class UserModule {}
