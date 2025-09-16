import { Injectable } from '@nestjs/common';
import { CreateWebSubscribeDto } from './dto/create-web-subscribe.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WebSubscribeService {
  constructor(private prisma:PrismaService){}
  async create(createWebSubscribeDto: CreateWebSubscribeDto) {
    const response = await this.prisma.web_subscribe.create({data:createWebSubscribeDto})
    return response;
  }

  findAll() {
   const response= this.prisma.web_subscribe.findMany();
   return response;
  }
}
