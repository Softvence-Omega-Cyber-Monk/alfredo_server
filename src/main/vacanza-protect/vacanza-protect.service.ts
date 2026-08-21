import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import Stripe from 'stripe';
import {
  ProtectPlan,
  ProtectPlanType,
  ProtectPurchaseSource,
  ProtectPurchaseStatus,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProtectCheckoutDto } from './dto/create-protect-checkout.dto';
import { UpdateProtectPlanDto } from './dto/update-protect-plan.dto';

/** Metadata flag that tells the shared Stripe webhook this session is a Protect purchase. */
export const PROTECT_CHECKOUT_PURPOSE = 'VACANZA_PROTECT';

/** Prices the plans start with. They can be changed later from the admin dashboard. */
const DEFAULT_PLANS: Record<
  ProtectPlanType,
  { price: number; coverAmount: number; priceIdEnv: string }
> = {
  [ProtectPlanType.YEARLY]: {
    price: 30,
    coverAmount: 5000,
    priceIdEnv: 'STRIPE_PROTECT_YEARLY_PRICE_ID',
  },
  [ProtectPlanType.PER_TRIP]: {
    price: 7,
    coverAmount: 5000,
    priceIdEnv: 'STRIPE_PROTECT_PER_TRIP_PRICE_ID',
  },
};

@Injectable()
export class VacanzaProtectService {
  private readonly logger = new Logger(VacanzaProtectService.name);
  private stripe: Stripe;

  constructor(private prisma: PrismaService) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {});
  }

  /** Creates the two default plans the first time they are needed. */
  private async ensurePlansSeeded() {
    const count = await this.prisma.protectPlan.count();
    if (count > 0) return;

    await Promise.all(
      (Object.keys(DEFAULT_PLANS) as ProtectPlanType[]).map((type) =>
        this.prisma.protectPlan.upsert({
          where: { type },
          update: {},
          create: {
            type,
            price: DEFAULT_PLANS[type].price,
            coverAmount: DEFAULT_PLANS[type].coverAmount,
            priceId: process.env[DEFAULT_PLANS[type].priceIdEnv] || '',
          },
        }),
      ),
    );
  }

  async getPlans() {
    await this.ensurePlansSeeded();

    return this.prisma.protectPlan.findMany({
      where: { isActive: true },
      orderBy: { price: 'asc' },
    });
  }

  async updatePlan(id: string, dto: UpdateProtectPlanDto) {
    const plan = await this.prisma.protectPlan.findUnique({ where: { id } });
    if (!plan) throw new NotFoundException('Protect plan not found');

    return this.prisma.protectPlan.update({ where: { id }, data: dto });
  }

  /**
   * Builds the Stripe Checkout session for a Protect purchase and records a
   * PENDING purchase. The purchase is only activated once Stripe confirms the
   * payment through the webhook.
   *
   * Vacanza Protect is sold as a standalone insurance product, so no account is
   * needed: guests buy with their email alone. When a logged in member buys from
   * the dashboard the purchase is additionally linked to their account.
   */
  async createCheckoutSession(dto: CreateProtectCheckoutDto, user?: any) {
    await this.ensurePlansSeeded();

    const plan = await this.prisma.protectPlan.findUnique({
      where: { type: dto.planType },
    });

    if (!plan || !plan.isActive) {
      throw new NotFoundException('This Vacanza Protect plan is not available');
    }

    const account = user?.id
      ? await this.prisma.user.findUnique({
          where: { id: user.id },
          select: { id: true, email: true, fullName: true },
        })
      : null;

    const email = account?.email || dto.email;
    if (!email) {
      throw new BadRequestException(
        'An email address is required to buy Vacanza Protect',
      );
    }

    const isYearly = plan.type === ProtectPlanType.YEARLY;
    const trips = isYearly ? 0 : (dto.trips ?? 1);
    const quantity = isYearly ? 1 : trips;
    const amount = plan.price * quantity;

    const purchase = await this.prisma.protectPurchase.create({
      data: {
        userId: account?.id ?? null,
        email,
        fullName: account?.fullName ?? dto.fullName ?? null,
        planId: plan.id,
        planType: plan.type,
        amount,
        currency: plan.currency,
        tripsCovered: trips,
        propertyAddress: dto.propertyAddress ?? null,
        source: dto.source ?? ProtectPurchaseSource.LANDING,
      },
    });

    const metadata = {
      purpose: PROTECT_CHECKOUT_PURPOSE,
      purchaseId: purchase.id,
      planType: plan.type,
      userId: account?.id ?? '',
    };

    try {
      const session = await this.stripe.checkout.sessions.create({
        mode: isYearly ? 'subscription' : 'payment',
        allow_promotion_codes: true,
        customer_email: email,
        line_items: [{ ...this.buildLineItem(plan), quantity }],
        success_url: this.successUrl(),
        cancel_url: this.cancelUrl(),
        metadata,
        ...(isYearly
          ? { subscription_data: { metadata } }
          : { payment_intent_data: { metadata } }),
      });

      await this.prisma.protectPurchase.update({
        where: { id: purchase.id },
        data: { stripeSessionId: session.id },
      });

      return { url: session.url, purchaseId: purchase.id };
    } catch (error) {
      await this.prisma.protectPurchase.update({
        where: { id: purchase.id },
        data: { status: ProtectPurchaseStatus.FAILED },
      });
      this.logger.error(
        `Failed to create Protect checkout session: ${error?.message}`,
      );
      throw new BadRequestException(
        'Could not start the checkout. Please try again.',
      );
    }
  }

  /**
   * Uses the configured Stripe Price when the admin set one, otherwise the price
   * is built inline from the amount stored in the database.
   */
  private buildLineItem(plan: ProtectPlan) {
    if (plan.priceId) return { price: plan.priceId };

    const isYearly = plan.type === ProtectPlanType.YEARLY;

    return {
      price_data: {
        currency: plan.currency.toLowerCase(),
        unit_amount: Math.round(plan.price * 100),
        product_data: {
          name: isYearly
            ? 'Vacanza Protect — Annual home cover'
            : 'Vacanza Protect — Single trip cover',
          description: isYearly
            ? 'Home insurance covering damage and theft for 12 months.'
            : 'Travel insurance covering a single trip.',
        },
        ...(isYearly ? { recurring: { interval: 'year' as const } } : {}),
      },
    };
  }

  private successUrl() {
    const base = process.env.CLIENT_URL || 'https://vacanzagreece.gr';
    return (
      process.env.PROTECT_SUCCESS_URL ||
      `${base.replace(/\/$/, '')}/success?protect=1`
    );
  }

  private cancelUrl() {
    const base = process.env.CLIENT_URL || 'https://vacanzagreece.gr';
    return (
      process.env.PROTECT_CANCEL_URL ||
      `${base.replace(/\/$/, '')}/vacanzaprotect?checkout=cancelled`
    );
  }

  /** Called by the shared Stripe webhook when a Protect checkout is paid. */
  async handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    const purchaseId = session.metadata?.purchaseId;
    if (!purchaseId) {
      this.logger.warn('Protect checkout completed without a purchaseId');
      return;
    }

    const purchase = await this.prisma.protectPurchase.findUnique({
      where: { id: purchaseId },
    });

    if (!purchase) {
      this.logger.warn(`Protect purchase ${purchaseId} no longer exists`);
      return;
    }

    // Guests buy without an account, but if that email already belongs to a
    // Vacanza member we link it so the cover shows on their dashboard too.
    const userId =
      purchase.userId ||
      (
        await this.prisma.user.findUnique({
          where: { email: purchase.email },
          select: { id: true },
        })
      )?.id ||
      null;

    const startDate = new Date();
    const endDate =
      purchase.planType === ProtectPlanType.YEARLY
        ? new Date(
            new Date(startDate).setFullYear(startDate.getFullYear() + 1),
          )
        : null;

    await this.prisma.protectPurchase.update({
      where: { id: purchase.id },
      data: {
        userId,
        status: ProtectPurchaseStatus.ACTIVE,
        amount: session.amount_total
          ? session.amount_total / 100
          : purchase.amount,
        currency: (session.currency || purchase.currency).toUpperCase(),
        stripeSubscriptionId: (session.subscription as string) || null,
        stripePaymentIntentId: (session.payment_intent as string) || null,
        startDate,
        endDate,
      },
    });

    this.logger.log(`Vacanza Protect activated for ${purchase.email}`);
  }

  /** Called by the shared Stripe webhook when a yearly cover is cancelled. */
  async handleSubscriptionDeleted(subscriptionId: string) {
    const purchase = await this.prisma.protectPurchase.findFirst({
      where: { stripeSubscriptionId: subscriptionId },
    });
    if (!purchase) return;

    await this.prisma.protectPurchase.update({
      where: { id: purchase.id },
      data: { status: ProtectPurchaseStatus.CANCELLED },
    });
  }

  /** Cover status for the logged in user, used by the dashboard widget. */
  async getMyProtection(userId: string) {
    const purchases = await this.prisma.protectPurchase.findMany({
      where: { userId, status: ProtectPurchaseStatus.ACTIVE },
      orderBy: { createdAt: 'desc' },
      include: { plan: true },
    });

    const now = new Date();
    const yearly = purchases.find(
      (p) =>
        p.planType === ProtectPlanType.YEARLY &&
        (!p.endDate || p.endDate > now),
    );
    const tripsRemaining = purchases
      .filter((p) => p.planType === ProtectPlanType.PER_TRIP)
      .reduce((total, p) => total + p.tripsCovered, 0);

    return {
      isProtected: Boolean(yearly) || tripsRemaining > 0,
      yearlyCover: yearly
        ? { validUntil: yearly.endDate, amount: yearly.amount }
        : null,
      tripsRemaining,
      purchases,
    };
  }

  /** Admin listing: every Protect buyer plus totals for the summary cards. */
  async findAllPurchases(filters: {
    status?: ProtectPurchaseStatus;
    planType?: ProtectPlanType;
  }) {
    const where = {
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.planType ? { planType: filters.planType } : {}),
    };

    const purchases = await this.prisma.protectPurchase.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        plan: true,
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            photo: true,
            phoneNumber: true,
          },
        },
      },
    });

    const paid = purchases.filter(
      (p) => p.status === ProtectPurchaseStatus.ACTIVE,
    );

    return {
      purchases,
      summary: {
        totalPurchases: purchases.length,
        activeCovers: paid.length,
        totalRevenue: paid.reduce((sum, p) => sum + p.amount, 0),
        yearlyCovers: paid.filter(
          (p) => p.planType === ProtectPlanType.YEARLY,
        ).length,
        perTripCovers: paid.filter(
          (p) => p.planType === ProtectPlanType.PER_TRIP,
        ).length,
      },
    };
  }

  async findOnePurchase(id: string) {
    const purchase = await this.prisma.protectPurchase.findUnique({
      where: { id },
      include: {
        plan: true,
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            photo: true,
            phoneNumber: true,
            createdAt: true,
          },
        },
      },
    });

    if (!purchase) throw new NotFoundException('Protect purchase not found');
    return purchase;
  }
}
