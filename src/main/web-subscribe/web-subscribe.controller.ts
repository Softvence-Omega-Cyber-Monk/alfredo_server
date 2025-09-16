import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { WebSubscribeService } from './web-subscribe.service';
import { CreateWebSubscribeDto } from './dto/create-web-subscribe.dto';

@Controller('web-subscribe')
export class WebSubscribeController {
  constructor(private readonly webSubscribeService: WebSubscribeService) {}

  @Post()
  async create(@Body() createWebSubscribeDto: CreateWebSubscribeDto) {
      const response = await this.webSubscribeService.create(createWebSubscribeDto);
      return{
       status:201,
        message:"Subscribed Successfully",
        data:response
      }
  }

  @Get()
  async findAll() {
    const response=await this.webSubscribeService.findAll();
    return{
      status:200,
      message:"Subscribed Successfully",
      data:response
    }
  }

}
