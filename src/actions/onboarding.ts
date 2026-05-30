"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUserId } from "@/server/auth";
import { OnboardingStep } from "@prisma/client";
import { z } from "zod";

const onboardingSchema = z.object({
  company: z.string().max(200).optional(),
  currency: z.string().length(3).default("USD"),
});

export async function completeOnboarding(formData: FormData) {
  const userId = await requireUserId();
  const parsed = onboardingSchema.safeParse({
    company: formData.get("company"),
    currency: formData.get("currency") ?? "USD",
  });

  await db.user.update({
    where: { id: userId },
    data: {
      company: parsed.success ? parsed.data.company : undefined,
      currency: parsed.success ? parsed.data.currency : "USD",
      onboardingStep: OnboardingStep.COMPLETED,
    },
  });

  revalidatePath("/dashboard");
}
