"use server";

import { revalidatePath } from "next/cache";
import { requireUserId } from "@/server/auth";
import { checkPlanLimit } from "@/server/guards";
import { generateAiInsight } from "@/services/ai-insights";
import { aiRatelimit, checkRateLimit } from "@/lib/ratelimit";
import type { ActionResult } from "./auth";

export async function refreshAiInsight(): Promise<
  ActionResult<{ content: string; score: number }>
> {
  const userId = await requireUserId();

  const rateCheck = await checkRateLimit(aiRatelimit, `ai:${userId}`);
  if (!rateCheck.success) {
    return { success: false, error: "AI rate limit exceeded. Try again in a minute." };
  }

  const limit = await checkPlanLimit(userId, "aiInsights");
  if (!limit.allowed) {
    return {
      success: false,
      error: `AI insight limit reached (${limit.current}/${limit.limit}). Upgrade to Pro.`,
    };
  }

  if (!process.env.OPENAI_API_KEY) {
    return {
      success: false,
      error: "AI insights are not configured. Add OPENAI_API_KEY to your environment.",
    };
  }

  try {
    const insight = await generateAiInsight(userId);
    revalidatePath("/dashboard");
    return { success: true, data: insight };
  } catch {
    return {
      success: false,
      error: "Failed to generate insight. Please try again.",
    };
  }
}
