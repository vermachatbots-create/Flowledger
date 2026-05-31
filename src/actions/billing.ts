"use server";

import Razorpay from "razorpay";
import { db } from "@/lib/db";
import { requireUserId } from "@/server/auth";
import { SubscriptionTier } from "@prisma/client";

const razorpay = new Razorpay({
key_id: process.env.RAZORPAY_KEY_ID!,
key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

const RAZORPAY_PLANS = {
PRO: process.env.RAZORPAY_PRO_PLAN_ID!,
TEAM: process.env.RAZORPAY_TEAM_PLAN_ID!,
};

export async function createCheckoutSession(
tier: "PRO" | "TEAM"
) {
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
total_count: 120,
notes: {
userId,
tier,
},
});

await db.subscription.create({
data: {
userId,
razorpaySubscriptionId: subscription.id,
status: subscription.status,
tier,
},
});

return {
subscriptionId: subscription.id,
razorpayKey:
process.env.RAZORPAY_KEY_ID,
user: {
name: user.name,
email: user.email,
},
};
}

export async function createBillingPortalSession() {
const userId = await requireUserId();

const subscription =
await db.subscription.findFirst({
where: { userId },
orderBy: {
createdAt: "desc",
},
});

if (!subscription) {
throw new Error(
"No active subscription found"
);
}

return {
subscriptionId:
subscription.razorpaySubscriptionId,
};
}

export async function cancelSubscription() {
const userId = await requireUserId();

const subscription =
await db.subscription.findFirst({
where: { userId },
orderBy: {
createdAt: "desc",
},
});

if (
!subscription?.razorpaySubscriptionId
) {
throw new Error(
"Subscription not found"
);
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
status: "cancelled",
},
});

return {
success: true,
};
}

export async function getSubscriptionStatus() {
const userId = await requireUserId();

const user =
await db.user.findUniqueOrThrow({
where: { id: userId },
select: {
subscriptionTier: true,
subscriptions: {
orderBy: {
createdAt: "desc",
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
}
