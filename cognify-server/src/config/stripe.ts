import Stripe from "stripe";
import { env } from "./env";

// Stripe is optional — only initialised when STRIPE_SECRET_KEY is set
export const stripe = env.STRIPE_SECRET_KEY
  ? new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: "2022-11-15" as any, // Cast as any to avoid SDK version discrepancies in IDE
    })
  : null;
