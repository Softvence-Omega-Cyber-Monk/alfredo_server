import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Headers, BadRequestException, RawBodyRequest, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { StripePaymentService } from './stripe-payment.service';
import { CreateStripePaymentDto } from './dto/create-stripe-payment.dto';
import { UpdateStripePaymentDto } from './dto/update-stripe-payment.dto';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from 'src/common/decorators/user.decorator';


@ApiTags('Stripe Payment')
@Controller('stripe-payment')
export class StripePaymentController {
  constructor(private readonly stripePaymentService: StripePaymentService) {}

  /** Checkout Session */
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
  @Post('checkout')
  
  @ApiBody({ type: CreateStripePaymentDto })
  async checkout(@User() user:any,@Body() body: CreateStripePaymentDto,) {
    console.log(user)
    return this.stripePaymentService.createCheckoutSession(
      body.priceId,
      user,
      body.planId,
      body.planDuration
    );
  }

  /** Stripe Webhook */
@Post('webhook')
async handleStripeWebhook(
    @Headers('stripe-signature') signature: string,
   @Req() req: RawBodyRequest<Request>,

) {


  return this.stripePaymentService.handleWebhook(req);
}

  /** CRUD Endpoints */
  @Get()
  findAll() {
    return this.stripePaymentService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.stripePaymentService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateStripePaymentDto: UpdateStripePaymentDto) {
    return this.stripePaymentService.update(+id, updateStripePaymentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.stripePaymentService.remove(+id);
  }
}
