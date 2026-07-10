import { stripe } from "../../config/stripe";
import { subscriptionService } from "./subscription.service";
import { logger } from "../../config/logger";
import { env } from "../../config/env";

export const webhookService = {
  constructEvent(rawBody: Buffer, signature: string) {
    if (!stripe) {
      throw new Error("Stripe integration is not configured. Please set STRIPE_SECRET_KEY.");
    }
    return stripe.webhooks.constructEvent(
      rawBody,
      signature,
      env.STRIPE_WEBHOOK_SECRET
    );
  },

  async handleEvent(event: { type: string; data: { object: any } }): Promise<void> {
    logger.info(`Stripe webhook: ${event.type}`);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const userId  = session.metadata?.userId as string | undefined;
        const plan    = session.metadata?.plan as "PRO" | "ENTERPRISE" | undefined;

        if (!userId || !plan) break;

        await subscriptionService.upgradePlan(
          userId,
          plan,
          typeof session.subscription === "string" ? session.subscription : undefined
        );
        break;
      }

      case "customer.subscription.updated": {
        const sub     = event.data.object;
        const userId  = sub.metadata?.userId as string | undefined;
        const planNick = sub.items?.data?.[0]?.price?.nickname?.toUpperCase?.() as string | undefined;

        if (!userId) break;

        const plan = (["PRO", "ENTERPRISE"].includes(planNick ?? "")
          ? planNick
          : "FREE") as "FREE" | "PRO" | "ENTERPRISE";

        await subscriptionService.upgradePlan(
          userId,
          plan,
          sub.id,
          typeof sub.current_period_end === "number"
            ? new Date(sub.current_period_end * 1000)
            : undefined
        );
        break;
      }

      case "customer.subscription.deleted": {
        const sub    = event.data.object;
        const userId = sub.metadata?.userId as string | undefined;

        if (!userId) break;
        await subscriptionService.cancelPlan(userId);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object;
        logger.warn(`Payment failed for customer: ${invoice.customer}`);
        break;
      }

      default:
        logger.info(`Unhandled Stripe event: ${event.type}`);
    }
  },
};
