import { db } from "@/lib/db";
import { PLANS } from "@/lib/constants";
import { SubscriptionTier } from "@prisma/client";

export async function assertResourceOwnership(
  userId: string,
  resourceUserId: string
): Promise<void> {
  if (userId !== resourceUserId) {
    throw new Error("Unauthorized: resource does not belong to user");
  }
}

export async function checkPlanLimit(
  userId: string,
  resource: "invoices" | "clients" | "expenses" | "aiInsights"
): Promise<{ allowed: boolean; limit: number; current: number }> {
  const user = await db.user.findUniqueOrThrow({
    where: { id: userId },
    select: { subscriptionTier: true },
  });

  const tier = user.subscriptionTier as SubscriptionTier;
  const plan = PLANS[tier] ?? PLANS.FREE;
  const limit = plan.limits[resource];

  if (limit === -1) return { allowed: true, limit: -1, current: 0 };

  const counts = {
    invoices: () => db.invoice.count({ where: { userId } }),
    clients: () => db.client.count({ where: { userId } }),
    expenses: () => db.expense.count({ where: { userId } }),
    aiInsights: () => db.aiInsight.count({ where: { userId } }),
  };

  const current = await counts[resource]();
  return { allowed: current < limit, limit, current };
}
