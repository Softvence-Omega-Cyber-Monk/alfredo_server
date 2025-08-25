import { BadRequestException, Injectable, RawBodyRequest } from '@nestjs/common';

import { UpdateStripePaymentDto } from './dto/update-stripe-payment.dto';
import Stripe from 'stripe';
import { Request } from 'express';

@Injectable()
export class StripePaymentService {
 private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
     
    });
  }
  async createCheckoutSession(priceId: string, successUrl: string, cancelUrl: string) {
    const price = await this.stripe.prices.retrieve(priceId);

    const session = await this.stripe.checkout.sessions.create({
      mode: price.recurring ? 'subscription' : 'payment',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    return { url: session.url };
  }

  /** ✅ Handle Stripe Webhooks */
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
        'whsec_a968f12ed41a71610da91cb2837041cd465858bdac3e80686104922aba1ed644',
      );
    } catch {
      throw new BadRequestException('Invalid Stripe signature');
    }

    // 🔥 Handle important events
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.payment_status === 'paid') {
          console.log('💰 Payment success:')
          console.log('💰 Payment success:', session.id, session.customer_email);
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
  findAll() {
    return `This action returns all stripePayment`;
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
