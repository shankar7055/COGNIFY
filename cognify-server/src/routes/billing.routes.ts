import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { stripeService } from "../services/billing/stripe.service";
import { webhookService } from "../services/billing/webhook.service";
import { subscriptionService } from "../services/billing/subscription.service";
import { razorpay } from "../config/razorpay";
import { prisma } from "../config/db";
import { env } from "../config/env";
import { logger } from "../config/logger";
import express from "express";
import crypto from "crypto";

const router = Router();

/** GET /api/billing/subscription — current user subscription */
router.get("/subscription", authMiddleware, async (req, res) => {
  try {
    const sub = await subscriptionService.getSubscription((req as any).userId);
    res.json(sub);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

/** POST /api/billing/checkout — create checkout order or session */
router.post("/checkout", authMiddleware, async (req, res) => {
  try {
    const { plan } = req.body;

    if (!["PRO", "ENTERPRISE"].includes(plan)) {
      return res.status(400).json({ message: "Invalid plan. Choose PRO or ENTERPRISE." });
    }

    // 1. If Razorpay is configured, use Razorpay Orders (primary for India)
    if (razorpay) {
      const amount = plan === "PRO" ? 650000 : 2500000; // in INR paise (e.g. ₹6,500 or ₹25,000)
      const order = await (razorpay as any).orders.create({
        amount,
        currency: "INR",
        receipt: `rcpt_${Date.now()}_${(req as any).userId.slice(0, 8)}`,
        notes: {
          userId: (req as any).userId,
          plan,
        },
      });

      return res.json({
        gateway: "razorpay",
        key_id: env.RAZORPAY_KEY_ID,
        amount: order.amount,
        order_id: order.id,
        plan,
      });
    }

    // 2. Otherwise fallback to Stripe
    const url = await stripeService.createCheckoutSession(
      (req as any).userId,
      plan
    );

    res.json({ url });
  } catch (err: any) {
    logger.error("Checkout error", { err });
    res.status(500).json({ message: err.message });
  }
});

/** POST /api/billing/verify — verify Razorpay payment and upgrade subscription */
router.post("/verify", authMiddleware, async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, plan } = req.body;
    const userId = (req as any).userId;

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return res.status(400).json({ message: "Missing verification parameters" });
    }

    // Verify signature: HMACSha256(order_id + "|" + payment_id, key_secret)
    const hmac = crypto.createHmac("sha256", env.RAZORPAY_KEY_SECRET);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generatedSignature = hmac.digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Payment verification failed" });
    }

    // Update locally in Prisma
    const tokenLimit = plan === "PRO" ? 100000 : 10000000;
    await prisma.subscription.upsert({
      where: { user_id: userId },
      create: {
        user_id: userId,
        plan,
        stripe_sub_id: razorpay_order_id,
        stripe_customer_id: razorpay_payment_id,
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        token_limit: tokenLimit,
      },
      update: {
        plan,
        stripe_sub_id: razorpay_order_id,
        stripe_customer_id: razorpay_payment_id,
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        token_limit: tokenLimit,
        tokens_used: 0,
      },
    });

    res.json({ success: true, message: "Subscription upgraded successfully" });
  } catch (err: any) {
    logger.error("Verification error", { err });
    res.status(500).json({ message: err.message });
  }
});

/** POST /api/billing/portal — create Stripe billing portal session */
router.post("/portal", authMiddleware, async (req, res) => {
  try {
    const url = await stripeService.createPortalSession((req as any).userId);
    res.json({ url });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * POST /api/billing/webhook
 * Stripe webhook — must use raw body (not JSON-parsed).
 */
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const signature = req.headers["stripe-signature"];

    if (!signature) {
      return res.status(400).json({ message: "Missing stripe-signature header" });
    }

    try {
      const event = webhookService.constructEvent(
        req.body as Buffer,
        signature as string
      );

      await webhookService.handleEvent(event);
      res.json({ received: true });
    } catch (err: any) {
      logger.error("Webhook error", { err });
      res.status(400).json({ message: `Webhook error: ${err.message}` });
    }
  }
);

export default router;
