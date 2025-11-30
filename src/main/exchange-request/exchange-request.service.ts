import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExchangeRequestDto } from './dto/create-exchange-request.dto';
import { UpdateExchangeRequestDto } from './dto/update-exchange-request.dto';
import { BadgeService } from '../badge/badge.service';
import { BadgeType } from '@prisma/client';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class ExchangeRequestService {
  constructor(private readonly prisma: PrismaService,private badge:BadgeService,
    private readonly notification:NotificationService
  ) {}

  /** CREATE */
async create(createDto: CreateExchangeRequestDto) {
  console.log(createDto);

  // Validate users
  const fromUser = await this.prisma.user.findFirst({
    where: { id: createDto.fromUserId },
  });
  if (!fromUser) throw new NotFoundException('fromUserId does not exist');

  const toUser = await this.prisma.user.findFirst({
    where: { id: createDto.toUserId },
  });
  if (!toUser) throw new NotFoundException('toUserId does not exist');

  // Validate properties
  const fromProperty = await this.prisma.property.findFirst({
    where: { id: createDto.fromPropertyId },
  });
  if (!fromProperty) throw new NotFoundException('fromPropertyId does not exist');

  const toProperty = await this.prisma.property.findFirst({
    where: { id: createDto.toPropertyId },
  });
  if (!toProperty) throw new NotFoundException('toPropertyId does not exist');

  // Create exchange request (no transaction)
  const exchange = await this.prisma.exchangeRequest.create({
    data: {
      message: createDto.message,
      status: 'PENDING',
      fromUserId: createDto.fromUserId,
      toUserId: createDto.toUserId,
      fromPropertyId: createDto.fromPropertyId,
      toPropertyId: createDto.toPropertyId,
    },
    include: {
      fromUser: true,
      toUser: true,
      fromProperty: true,
      toProperty: true,
      chatMessages: true,
    },
  });

  await this.notification.createNotification(
    createDto.toUserId,
    'New Exchange Request',
    `You have a new exchange request from ${fromUser.fullName}`
  );

  return exchange;
}


  /** READ ALL */
  async findAll() {
    return this.prisma.exchangeRequest.findMany({
      include: {
        fromUser: true,
        toUser: true,
        fromProperty: true,
        toProperty: true,
        chatMessages: true,
      },
    });
  }

  /** READ ONE BY ID */
  async findOne(id: string) {
    const exchangeRequest = await this.prisma.exchangeRequest.findUnique({
      where: { id },
      include: {
        fromUser: true,
        toUser: true,
        fromProperty: true,
        toProperty: true,
        chatMessages: true,
      },
    });
    if (!exchangeRequest)
      throw new NotFoundException(`ExchangeRequest with ID ${id} not found`);
    return exchangeRequest;
  }

  /** UPDATE */
  async update(id: string, updateDto: UpdateExchangeRequestDto) {
    const existing = await this.prisma.exchangeRequest.findUnique({
      where: { id },
    });
    if (!existing)
      throw new NotFoundException(`ExchangeRequest with ID ${id} not found`);

    // Handle foreign keys if included in update
    const data: any = { ...updateDto };
    if (updateDto.fromUserId)
      data.fromUser = { connect: { id: updateDto.fromUserId } };
    if (updateDto.toUserId)
      data.toUser = { connect: { id: updateDto.toUserId } };
    if (updateDto.fromPropertyId)
      data.fromProperty = { connect: { id: updateDto.fromPropertyId } };
    if (updateDto.toPropertyId)
      data.toProperty = { connect: { id: updateDto.toPropertyId } };

    return this.prisma.exchangeRequest.update({
      where: { id },
      data,
      include: {
        fromUser: true,  
        toUser: true,
        fromProperty: true,
        toProperty: true,
        chatMessages: true,
      },
    });
  }

  /** DELETE */
  async remove(id: string) {
    const existing = await this.prisma.exchangeRequest.findUnique({
      where: { id },
    });
    if (!existing)
      throw new NotFoundException(`ExchangeRequest with ID ${id} not found`);

    await this.prisma.exchangeRequest.delete({ where: { id } });
    return { message: `ExchangeRequest with ID ${id} deleted successfully` };
  }

/** UPDATE */
async acceptExchangeRequest(id: string) {
  // 1. Check existing request
  const existing = await this.prisma.exchangeRequest.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new NotFoundException(`ExchangeRequest with ID ${id} not found`);
  }

  // 2. Fetch both users
  const toUser = await this.prisma.user.findUnique({
    where: { id: existing.toUserId },
  });

  const fromUser = await this.prisma.user.findUnique({
    where: { id: existing.fromUserId },
  });

  // 3. Update the exchange request status to ACCEPTED
  const res = await this.prisma.exchangeRequest.update({
    where: { id },
    data: { status: 'ACCEPTED' },
    include: {
      fromUser: true,
      toUser: true,
      fromProperty: true,
      toProperty: true,
      chatMessages: true,
    },
  });

  // 4. Mark both properties as exchanged
  await this.prisma.property.update({
    where: { id: existing.fromPropertyId },
    data: { isExchanged: true },
  });

  await this.prisma.property.update({
    where: { id: existing.toPropertyId },
    data: { isExchanged: true },
  });

  // 5. Count accepted trades AFTER update (correct logic)
  const totalExchaneOfToUser = await this.prisma.exchangeRequest.count({
    where: {
      toUserId: toUser?.id,
      status: 'ACCEPTED',
    },
  });

  const totalExchaneOfFromUser = await this.prisma.exchangeRequest.count({
    where: {
      toUserId: fromUser?.id,
      status: 'ACCEPTED',
    },
  });

  // 6. Award badges to BOTH users (correct logic)
  if (toUser?.id) {
    if (totalExchaneOfToUser === 1) {
      await this.badge.awardBadgeToUser(toUser.id, BadgeType.THE_FIRST_TRADE);
    } else if (totalExchaneOfToUser === 20) {
      await this.badge.awardBadgeToUser(toUser.id, BadgeType.EXPERIENCED);
    } else if (totalExchaneOfToUser >= 100) {
      await this.badge.awardBadgeToUser(toUser.id, BadgeType.VETERAN);
    }
  }

  if (fromUser?.id) {
    if (totalExchaneOfFromUser === 1) {
      await this.badge.awardBadgeToUser(fromUser.id, BadgeType.THE_FIRST_TRADE);
    } else if (totalExchaneOfFromUser === 20) {
      await this.badge.awardBadgeToUser(fromUser.id, BadgeType.EXPERIENCED);
    } else if (totalExchaneOfFromUser >= 100) {
      await this.badge.awardBadgeToUser(fromUser.id, BadgeType.VETERAN);
    }
  }

  return res;
}

}
