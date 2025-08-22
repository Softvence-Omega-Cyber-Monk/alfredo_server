import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExchangeRequestDto } from './dto/create-exchange-request.dto';
import { UpdateExchangeRequestDto } from './dto/update-exchange-request.dto';

@Injectable()
export class ExchangeRequestService {
  constructor(private readonly prisma: PrismaService) {}

  /** CREATE */
  async create(createDto: CreateExchangeRequestDto) {
    console.log(createDto)
    // Validate related users
    const fromUser = await this.prisma.pendingUser.findUnique({ where: { id: createDto.fromUserId } });
    console.log(fromUser)
    const toUser = await this.prisma.pendingUser.findUnique({ where: { id: createDto.toUserId } });
    if (!toUser) throw new NotFoundException('toUserId does not exist');

    // Validate related properties
    const fromProperty = await this.prisma.property.findUnique({ where: { id: createDto.fromPropertyId } });
    if (!fromProperty) throw new NotFoundException('fromPropertyId does not exist');

    const toProperty = await this.prisma.property.findUnique({ where: { id: createDto.toPropertyId } });
    if (!toProperty) throw new NotFoundException('toPropertyId does not exist');

    // Create ExchangeRequest with proper relations
    return this.prisma.exchangeRequest.create({
      data: {
        message: createDto.message,
        status: 'PENDING',
        fromUser: { connect: { id: createDto.fromUserId } },
        toUser: { connect: { id: createDto.toUserId } },
        fromProperty: { connect: { id: createDto.fromPropertyId } },
        toProperty: { connect: { id: createDto.toPropertyId } },
      },
      include: {
        fromUser: true,
        toUser: true,
        fromProperty: true,
        toProperty: true,
        chatMessages: true,
      },
    });
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
    if (!exchangeRequest) throw new NotFoundException(`ExchangeRequest with ID ${id} not found`);
    return exchangeRequest;
  }

  /** UPDATE */
  async update(id: string, updateDto: UpdateExchangeRequestDto) {
    const existing = await this.prisma.exchangeRequest.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`ExchangeRequest with ID ${id} not found`);

    // Handle foreign keys if included in update
    const data: any = { ...updateDto };
    if (updateDto.fromUserId) data.fromUser = { connect: { id: updateDto.fromUserId } };
    if (updateDto.toUserId) data.toUser = { connect: { id: updateDto.toUserId } };
    if (updateDto.fromPropertyId) data.fromProperty = { connect: { id: updateDto.fromPropertyId } };
    if (updateDto.toPropertyId) data.toProperty = { connect: { id: updateDto.toPropertyId } };

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
    const existing = await this.prisma.exchangeRequest.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`ExchangeRequest with ID ${id} not found`);

    await this.prisma.exchangeRequest.delete({ where: { id } });
    return { message: `ExchangeRequest with ID ${id} deleted successfully` };
  }
}
