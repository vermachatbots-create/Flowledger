import Stripe from "stripe";
import { PLANS } from "@/lib/constants";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-11-20.acacia",
  typescript: true,
});

export const STRIPE_PRICES = {
  PRO: process.env.STRIPE_PRO_PRICE_ID!,
  TEAM: process.env.STRIPE_TEAM_PRICE_ID!,
};

export function getPlanByPriceId(priceId: string) {
  if (priceId === STRIPE_PRICES.PRO) return PLANS.PRO;
  if (priceId === STRIPE_PRICES.TEAM) return PLANS.TEAM;
  return PLANS.FREE;
}
