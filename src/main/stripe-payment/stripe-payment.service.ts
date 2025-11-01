import {
  BadRequestException,
  HttpException,
  Injectable,
  RawBodyRequest,
} from '@nestjs/common';
import Stripe from 'stripe';
import { Request } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { BadgeType, SubscriptionStatus } from '@prisma/client';
import { BadgeService } from '../badge/badge.service';

@Injectable()
export class StripePaymentService {
  private stripe: Stripe;

  constructor(private prisma: PrismaService,private badgeService: BadgeService) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
      
    });
  }

  async createCheckoutSession(
    priceId: string,
    user: any,
    planId: string,
    planDuration: any,
  ) {
    const price = await this.stripe.prices.retrieve(priceId);

    const session = await this.stripe.checkout.sessions.create({
      mode:  'subscription',
      allow_promotion_codes:true,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: process.env.SUCCESS_URL,
      cancel_url: process.env.CANCEL_URL,
      discounts:[],
      metadata: {
        userId: user?.id || user,
        planId,
        planDuration,
      },
    });

    return { url: session.url };
  }

  /**  Handle Stripe Webhook Events */

async handleWebhook(req: RawBodyRequest<Request>) {
  let event: Stripe.Event;
  const rawBody = req.rawBody;
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

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.payment_status === 'paid') {
        const userId = session.metadata?.userId;
        const planId = session.metadata?.planId;
        const planDuration = parseInt(session.metadata?.planDuration || '1', 10);

        if (!userId || !planId) {
          console.warn('⚠️ Missing metadata: cannot create subscription record');
          return;
        }

        const startDate = new Date();
        const endDate = new Date(startDate);
        endDate.setFullYear(endDate.getFullYear() + planDuration);
        const subscription = await this.prisma.subscription.create({
          data: {
            userId,
            planId,
            endDate,
            autoRenew: true,
            stripeSubscriptionId: session.subscription as string,
          },
        });

        await this.prisma.user.update({
          where: { id: userId },
          data: { isSubscribed: true },
        });
        await this.prisma.payment.create({
          data: {
            subscription: { connect: { id: subscription.id } },
            amount: session.amount_total ? session.amount_total / 100 : 0,
            currency: session.currency || 'USD',
            status: 'SUCCESS',
          },
        });


        await this.badgeService.awardBadgeToUser(userId, BadgeType.PREMIUM_TRAVELER);
      }

      console.log('💰 Checkout session completed and subscription created');
      break;
    }

    case 'payment_intent.payment_failed':
      console.log('❌ Payment failed');
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return { received: true };
}


  /** ✅ Stop Auto-Renew */
  async stopAutoRenew(subscriptionId: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id: subscriptionId },
    });

    if (!subscription || !subscription.stripeSubscriptionId) {
      throw new BadRequestException('Subscription not found.');
    }

    // Stop auto-renew in Stripe
    await this.stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    // Update DB
    if(subscription.autoRenew){
      return this.prisma.subscription.update({
      where: { id: subscription.id },
      data: { autoRenew: false },
    });
    }
    return this.prisma.subscription.update({
      where: { id: subscription.id },
      data: { autoRenew:true },
    });
  }

  /** ✅ Resume Auto-Renew */
  async resumeAutoRenew(subscriptionId: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id: subscriptionId },
    });

    if (!subscription || !subscription.stripeSubscriptionId) {
      throw new BadRequestException('Subscription not found.');
    }

    await this.stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: false,
    });

    return this.prisma.subscription.update({
      where: { id: subscription.id },
      data: { autoRenew: true },
    });
  }

  /** ✅ Fetch All Payments Summary */
  async findAll() {
    try {
      const payments = await this.prisma.payment.findMany();
      const summary = await this.prisma.payment.aggregate({
        _sum: { amount: true },
        _count: true,
        _avg: { amount: true },
      });

      return {
        payments,
        totalAmount: summary._sum.amount || 0,
        totalCount: summary._count || 0,
        averageAmount: summary._avg.amount || 0,
      };
    } catch (error) {
      throw new HttpException('Failed to fetch payments', 500);
    }
  }
}
