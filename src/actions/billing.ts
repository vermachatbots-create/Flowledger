"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireUserId } from "@/server/auth";
import { stripe, STRIPE_PRICES } from "@/lib/stripe";
import { SubscriptionTier } from "@prisma/client";

export async function createCheckoutSession(tier: "PRO" | "TEAM") {
  const userId = await requireUserId();
  const user = await db.user.findUniqueOrThrow({ where: { id: userId } });

  let customerId = user.stripeCustomerId;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email ?? undefined,
      name: user.name ?? undefined,
      metadata: { userId },
    });
    customerId = customer.id;
    await db.user.update({
      where: { id: userId },
      data: { stripeCustomerId: customerId },
    });
  }

  const priceId = tier === "PRO" ? STRIPE_PRICES.PRO : STRIPE_PRICES.TEAM;

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
    metadata: { userId, tier },
  });

  if (!session.url) throw new Error("Failed to create checkout session");
  redirect(session.url);
}

export async function createBillingPortalSession() {
  const userId = await requireUserId();
  const user = await db.user.findUniqueOrThrow({ where: { id: userId } });

  if (!user.stripeCustomerId) {
    throw new Error("No billing account found");
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing`,
  });

  redirect(session.url);
}

export async function getSubscriptionStatus() {
  const userId = await requireUserId();
  const user = await db.user.findUniqueOrThrow({
    where: { id: userId },
    select: {
      subscriptionTier: true,
      stripeCustomerId: true,
      subscriptions: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  return {
    tier: user.subscriptionTier as SubscriptionTier,
    subscription: user.subscriptions[0] ?? null,
    hasStripe: !!user.stripeCustomerId,
  };
}
