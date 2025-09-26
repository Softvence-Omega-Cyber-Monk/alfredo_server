import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus, Res } from '@nestjs/common';
import { WebSubscribeService } from './web-subscribe.service';
import { CreatePromotionalEmailDto, CreateWebSubscribeDto } from './dto/create-web-subscribe.dto';
import { ApiBody } from '@nestjs/swagger';

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

  @Post('/promotional-mail')
    @ApiBody({ type: CreatePromotionalEmailDto })

    async sendPromotionalMail(@Body() body: { subject: string; message: string }) {
        try{
          const { subject, message } = body;
        const data = await this.webSubscribeService.sendPromotionalMail(subject, message);
        return {
            success: true,
            message: 'Promotional mail sent successfully',
            data,
        };
    }
     catch(error){
        return {
            success: false,
            message: error.message || 'Failed to send promotional mail',
            error: error.message,
        };
  
         }    }
}
