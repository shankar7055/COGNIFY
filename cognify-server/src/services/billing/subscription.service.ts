import { prisma } from "../../config/db";
import { logger } from "../../config/logger";

const PLAN_LIMITS: Record<string, { tokens: number }> = {
  FREE:       { tokens: 10_000   },
  PRO:        { tokens: 500_000  },
  ENTERPRISE: { tokens: 5_000_000 },
};

export const subscriptionService = {
  /** Get current subscription for a user (creates FREE one if missing) */
  async getSubscription(userId: string) {
    const sub = await prisma.subscription.findUnique({
      where: { user_id: userId },
    });

    if (!sub) {
      return prisma.subscription.create({
        data: {
          user_id:     userId,
          plan:        "FREE",
          token_limit: PLAN_LIMITS.FREE.tokens,
        },
      });
    }

    return sub;
  },

  /** Upgrade user plan (called after successful Stripe webhook) */
  async upgradePlan(
    userId: string,
    plan: "FREE" | "PRO" | "ENTERPRISE",
    stripeSubId?: string,
    periodEnd?: Date
  ) {
    const limits = PLAN_LIMITS[plan];

    const updated = await prisma.subscription.upsert({
      where:  { user_id: userId },
      create: {
        user_id:           userId,
        plan,
        token_limit:       limits.tokens,
        stripe_sub_id:     stripeSubId,
        current_period_end: periodEnd,
      },
      update: {
        plan,
        token_limit:        limits.tokens,
        stripe_sub_id:      stripeSubId,
        current_period_end: periodEnd,
        tokens_used:        0, // reset on new billing cycle
        updated_at:         new Date(),
      },
    });

    logger.info(`User ${userId} upgraded to ${plan}`);
    return updated;
  },

  /** Cancel / downgrade to FREE */
  async cancelPlan(userId: string) {
    return prisma.subscription.update({
      where:  { user_id: userId },
      data: {
        plan:              "FREE",
        token_limit:       PLAN_LIMITS.FREE.tokens,
        stripe_sub_id:     null,
        current_period_end: null,
        updated_at:        new Date(),
      },
    });
  },

  /** Increment token usage and check against limit */
  async consumeTokens(
    userId: string,
    tokens: number
  ): Promise<{ allowed: boolean; remaining: number }> {
    const sub = await this.getSubscription(userId);

    if (sub.tokens_used + tokens > sub.token_limit) {
      return { allowed: false, remaining: Math.max(0, sub.token_limit - sub.tokens_used) };
    }

    await prisma.subscription.update({
      where: { user_id: userId },
      data:  { tokens_used: { increment: tokens } },
    });

    return { allowed: true, remaining: sub.token_limit - sub.tokens_used - tokens };
  },
};
