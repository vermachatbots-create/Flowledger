"use server";

import Razorpay from "razorpay";
import { db } from "@/lib/db";
import { requireUserId } from "@/server/auth";
import { SubscriptionTier, SubscriptionStatus } from "@prisma/client";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

const RAZORPAY_PLANS = {
  PRO: process.env.RAZORPAY_PRO_PLAN_ID!,
  TEAM: process.env.RAZORPAY_TEAM_PLAN_ID!,
};

const SUBSCRIPTION_DURATION_MONTHS = 120; // 10 years

export async function createCheckoutSession(tier: "PRO" | "TEAM") {
  try {
    const userId = await requireUserId();

    const user = await db.user.findUniqueOrThrow({
      where: { id: userId },
    });

    const planId =
      tier === "PRO"
        ? RAZORPAY_PLANS.PRO
        : RAZORPAY_PLANS.TEAM;

    const subscription =
      await razorpay.subscriptions.create({
        plan_id: planId,
        customer_notify: 1,
        total_count: SUBSCRIPTION_DURATION_MONTHS,
        notes: {
          userId,
          tier,
        },
      });

    if (!subscription?.id) {
      throw new Error("Failed to create Razorpay subscription");
    }

    await db.subscription.create({
      data: {
        userId,
        razorpaySubscriptionId: subscription.id,
        razorpayPlanId: planId,
        status: SubscriptionStatus.ACTIVE,
        tier: tier as SubscriptionTier,



        currentPeriodStart: new Date(),
        currentPeriodEnd:new Date(Date.now() + 30 * 24 * 60 *60 * 1000),
      },
    });

    return {
      subscriptionId: subscription.id,
      razorpayKey: process.env.RAZORPAY_KEY_ID,
      user: {
        name: user.name,
        email: user.email,
      },
    };
  } catch (error) {
    console.error("Error creating checkout session:", error);
    throw error;
  }
}

export async function createBillingPortalSession() {
  try {
    const userId = await requireUserId();

    const subscription =
      await db.subscription.findFirst({
        where: { userId },
        orderBy: {
          createAt: "desc",
        },
      });

    if (!subscription) {
      throw new Error("No active subscription found");
    }

    return {
      subscriptionId:
        subscription.razorpaySubscriptionId,
    };
  } catch (error) {
    console.error("Error creating billing portal session:", error);
    throw error;
  }
}

export async function cancelSubscription() {
  try {
    const userId = await requireUserId();

    const subscription =
      await db.subscription.findFirst({
        where: { userId },
        orderBy: {
          createAt: "desc",
        },
      });

    if (!subscription?.razorpaySubscriptionId) {
      throw new Error("Subscription not found");
    }

    await razorpay.subscriptions.cancel(
      subscription.razorpaySubscriptionId,
      true
    );

    await db.subscription.update({
      where: {
        id: subscription.id,
      },
      data: {
        status: SubscriptionStatus.CANCELED,
      },
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error canceling subscription:", error);
    throw error;
  }
}

export async function getSubscriptionStatus() {
  try {
    const userId = await requireUserId();

    const user =
      await db.user.findUniqueOrThrow({
        where: { id: userId },
        select: {
          subscriptionTier: true,
          subscriptions: {
            orderBy: {
              createAt: "desc",
            },
            take: 1,
          },
        },
      });

    return {
      tier:
        user.subscriptionTier as SubscriptionTier,
      subscription:
        user.subscriptions[0] ?? null,
      hasSubscription:
        !!user.subscriptions.length,
    };
  } catch (error) {
    console.error("Error fetching subscription status:", error);
    throw error;
  }
}