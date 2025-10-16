import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Req,
  Headers,
  RawBodyRequest,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { StripePaymentService } from './stripe-payment.service';
import { CreateStripePaymentDto } from './dto/create-stripe-payment.dto';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from 'src/common/decorators/user.decorator';

@ApiTags('Stripe Payment')
@Controller('stripe-payment')
export class StripePaymentController {
  constructor(private readonly stripePaymentService: StripePaymentService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('checkout')
  @ApiBody({ type: CreateStripePaymentDto })
  async checkout(@User() user: any, @Body() body: CreateStripePaymentDto) {
    return this.stripePaymentService.createCheckoutSession(
      body.priceId,
      user,
      body.planId,
      body.planDuration,
    );
  }

  @Post('webhook')
  async handleStripeWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: RawBodyRequest<Request>,
  ) {
    return this.stripePaymentService.handleWebhook(req);
  }
  @Get()
  findAll() {
    return this.stripePaymentService.findAll();
  }


 @Patch('subscription/:id/auto-renew')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
async toggleAutoRenew(
  @User() user: any,
  @Param('id') subscriptionId: string,
  @Body('autoRenew') autoRenew: boolean,
) {
  return  this.stripePaymentService.stopAutoRenew(subscriptionId);
}

}
