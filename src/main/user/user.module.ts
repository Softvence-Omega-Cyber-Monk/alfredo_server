import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaService } from '../prisma/prisma.service';
import { BadgeService } from '../badge/badge.service';
import { StorageService } from 'src/common/services/storage.service';

@Module({
  controllers: [UserController],
  providers: [UserService, PrismaService,BadgeService, StorageService],
  exports: [UserService],
})
export class UserModule {}
