import { stripe } from "../../config/stripe";
import { prisma } from "../../config/db";
import { env } from "../../config/env";
import { logger } from "../../config/logger";

const PLAN_PRICES: Record<string, string> = {
  PRO:        env.STRIPE_PRICE_PRO,
  ENTERPRISE: env.STRIPE_PRICE_ENTERPRISE,
};

export const stripeService = {
  /** Get or create a Stripe customer for a user */
  async getOrCreateCustomer(userId: string): Promise<string> {
    const sub = await prisma.subscription.findUnique({
      where: { user_id: userId },
      include: { user: true },
    });

    if (sub?.stripe_customer_id) return sub.stripe_customer_id;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("User not found");

    if (!stripe) {
      throw new Error("Stripe integration is not configured. Please set STRIPE_SECRET_KEY.");
    }

    const customer = await stripe.customers.create({
      email: user.email,
      name:  user.name ?? undefined,
      metadata: { userId },
    });

    // Store customer ID
    await prisma.subscription.upsert({
      where:  { user_id: userId },
      create: { user_id: userId, stripe_customer_id: customer.id },
      update: { stripe_customer_id: customer.id },
    });

    logger.info(`Stripe customer created: ${customer.id} for user ${userId}`);
    return customer.id;
  },

  /** Create a Stripe Checkout session for a plan upgrade */
  async createCheckoutSession(
    userId: string,
    plan: "PRO" | "ENTERPRISE"
  ): Promise<string> {
    const priceId = PLAN_PRICES[plan];
    if (!priceId) throw new Error(`No Stripe price configured for plan: ${plan}`);

    const customerId = await this.getOrCreateCustomer(userId);

    if (!stripe) {
      throw new Error("Stripe integration is not configured. Please set STRIPE_SECRET_KEY.");
    }

    const session = await stripe.checkout.sessions.create({
      customer:   customerId,
      mode:       "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${env.CLIENT_URL}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${env.CLIENT_URL}/billing/cancel`,
      metadata:    { userId, plan },
    });

    logger.info(`Checkout session created: ${session.id} for user ${userId}`);
    return session.url!;
  },

  /** Create a Stripe Billing Portal session to manage subscription */
  async createPortalSession(userId: string): Promise<string> {
    const customerId = await this.getOrCreateCustomer(userId);

    if (!stripe) {
      throw new Error("Stripe integration is not configured. Please set STRIPE_SECRET_KEY.");
    }

    const session = await stripe.billingPortal.sessions.create({
      customer:   customerId,
      return_url: `${env.CLIENT_URL}/billing`,
    });

    return session.url;
  },
};
