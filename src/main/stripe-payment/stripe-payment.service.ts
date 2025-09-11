import {
  BadRequestException,
  HttpException,
  Injectable,
  RawBodyRequest,
  Search,
} from '@nestjs/common';

import { UpdateStripePaymentDto } from './dto/update-stripe-payment.dto';
import Stripe from 'stripe';
import { Request } from 'express';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StripePaymentService {
  private stripe: Stripe;

  constructor(private prisma: PrismaService) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {});
  }
  async createCheckoutSession(
    priceId: string,
    user: any,
    planId: string,
    planDuration: any,
  ) {
    const price = await this.stripe.prices.retrieve(priceId);
    const session = await this.stripe.checkout.sessions.create({
      mode: price.recurring ? 'subscription' : 'payment',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: process.env.SUCCESS_URL,
      cancel_url: process.env.CANCEL_URL,
      metadata: {
        userId: user?.id || user, 
        planId: planId,
        planDuration: planDuration,
      },
    });
    console.log(session);
    return { url: session.url };
  }

  /** ✅ Handle Stripe Webhooks */
  async handleWebhook(req: RawBodyRequest<Request>) {
    let event: Stripe.Event;
    const rawBody = req.rawBody;
    console.log(rawBody);
    const signature = req.headers['stripe-signature'] as string;
    if (!rawBody) {
      throw new BadRequestException('No webhook payload was provided.');
    }

    try {
      event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET as string,
      );
    } catch {
      throw new BadRequestException('Invalid Stripe signature');
    }

    //  Handle important events
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.payment_status === 'paid') {
          console.log('💰 Payment success:');
          console.log(
            '💰 Payment success:',
            session.id,
            session.customer_email,
          );
          const userId = session.metadata?.userId;
          const planId = session.metadata?.planId;
          const planDuration = parseInt(
            session.metadata?.planDuration || '1',
            10,
          );
          if (!userId || !planId) {
            console.warn(
              '⚠️ Missing metadata: cannot create subscription record',
            );
            return;
          }
          const startDate = new Date();
          // End date = startDate + planDuration years
          const endDate = new Date(startDate);
          endDate.setFullYear(endDate.getFullYear() + planDuration);
          const subscription = await this.prisma.subscription.create({
            data: {
              userId: userId,
              planId: planId,
              endDate: endDate,
            },
          });
          console.log(subscription);
          await this.prisma.user.update({
            where: { id: userId },
            data: {
              isSubscribed: true,
            },
          });

          await this.prisma.payment.create({
            data: {
              subscription: {
                connect: { id: subscription.id },
              },
              amount: session.amount_total ? session.amount_total / 100 : 0,
              currency: session.currency || 'USD',
              status: 'SUCCESS',
            },
          });
        }
        break;

      case 'invoice.payment_succeeded':
        console.log('✅ Subscription renewed');
        break;

      case 'payment_intent.payment_failed':
        console.log('❌ Payment failed');
        break;

      default:
        console.log(`Unhandled event: ${event.type}`);
    }

    return { received: true };
  }
  async findAll() {
    try {
      const response = await this.prisma.payment.findMany();
      const summary = await this.prisma.payment.aggregate({
        _sum: { amount: true },
        _count: true,
        _avg: { amount: true },
      });
      return {
        response,
        totalAmount: summary._sum.amount || 0,
        totalCount: summary._count || 0,
        averageAmount: summary._avg.amount || 0,
      };
    } catch (error) {
      throw new HttpException('Faild to fectch All Payments', 500);
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} stripePayment`;
  }

  update(id: number, updateStripePaymentDto: UpdateStripePaymentDto) {
    return `This action updates a #${id} stripePayment`;
  }

  remove(id: number) {
    return `This action removes a #${id} stripePayment`;
  }
}
