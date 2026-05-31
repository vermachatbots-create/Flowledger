import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe, getPlanByPriceId } from "@/lib/razorpay";
import { db } from "@/lib/db";
import { SubscriptionTier, SubscriptionStatus } from "@prisma/client";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("stripe-signature");

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const tier = session.metadata?.tier as SubscriptionTier | undefined;
      if (userId && tier) {
        await db.user.update({
          where: { id: userId },
          data: { subscriptionTier: tier },
        });
      }
      break;
    }

    case "customer.subscription.updated":
    case "customer.subscription.created": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;
      const user = await db.user.findFirst({
        where: { stripeCustomerId: customerId },
      });
      if (!user) break;

      const priceId = subscription.items.data[0]?.price.id ?? "";
      const plan = getPlanByPriceId(priceId);

      await db.user.update({
        where: { id: user.id },
        data: { subscriptionTier: plan.tier },
      });

      await db.subscription.upsert({
        where: { stripeSubscriptionId: subscription.id },
        create: {
          userId: user.id,
          stripeSubscriptionId: subscription.id,
          stripePriceId: priceId,
          status: mapStripeStatus(subscription.status),
          currentPeriodStart: new Date(subscription.current_period_start * 1000),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
        },
        update: {
          status: mapStripeStatus(subscription.status),
          currentPeriodStart: new Date(subscription.current_period_start * 1000),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
        },
      });
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;
      const user = await db.user.findFirst({
        where: { stripeCustomerId: customerId },
      });
      if (user) {
        await db.user.update({
          where: { id: user.id },
          data: { subscriptionTier: SubscriptionTier.FREE },
        });
        await db.subscription.updateMany({
          where: { stripeSubscriptionId: subscription.id },
          data: { status: SubscriptionStatus.CANCELED },
        });
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}

function mapStripeStatus(status: Stripe.Subscription.Status): SubscriptionStatus {
  const map: Record<string, SubscriptionStatus> = {
    active: SubscriptionStatus.ACTIVE,
    past_due: SubscriptionStatus.PAST_DUE,
    canceled: SubscriptionStatus.CANCELED,
    trialing: SubscriptionStatus.TRIALING,
    incomplete: SubscriptionStatus.INCOMPLETE,
  };
  return map[status] ?? SubscriptionStatus.ACTIVE;
}
