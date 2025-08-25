import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Headers, BadRequestException, RawBodyRequest } from '@nestjs/common';
import { Request } from 'express';
import { StripePaymentService } from './stripe-payment.service';
import { CreateStripePaymentDto } from './dto/create-stripe-payment.dto';
import { UpdateStripePaymentDto } from './dto/update-stripe-payment.dto';
import { ApiBody, ApiTags } from '@nestjs/swagger';

@ApiTags('Stripe Payment')
@Controller('stripe-payment')
export class StripePaymentController {
  constructor(private readonly stripePaymentService: StripePaymentService) {}

  /** Checkout Session */
  @Post('checkout')
  @ApiBody({ type: CreateStripePaymentDto })
  async checkout(@Body() body: CreateStripePaymentDto) {
    return this.stripePaymentService.createCheckoutSession(
      body.priceId,
      body.successUrl,
      body.cancelUrl,
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
