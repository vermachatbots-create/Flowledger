import Stripe from "stripe";
import { PLANS } from "@/lib/constants";

let stripeClient: Stripe | undefined;

export function getStripe(): Stripe {
  if (!stripeClient) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }
    stripeClient = new Stripe(secretKey, {
      apiVersion: "2025-02-24.acacia",
      typescript: true,
    });
  }
  return stripeClient;
}

export const STRIPE_PRICES = {
  PRO: process.env.STRIPE_PRO_PRICE_ID ?? "",
  TEAM: process.env.STRIPE_TEAM_PRICE_ID ?? "",
};

export function getPlanByPriceId(priceId: string) {
  if (priceId === STRIPE_PRICES.PRO) return PLANS.PRO;
  if (priceId === STRIPE_PRICES.TEAM) return PLANS.TEAM;
  return PLANS.FREE;
}
