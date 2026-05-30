"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUserId } from "@/server/auth";
import { checkPlanLimit, assertResourceOwnership } from "@/server/guards";
import { clientSchema } from "@/validators/client";
import type { ActionResult } from "./auth";

export async function createClient(input: unknown): Promise<ActionResult<{ id: string }>> {
  const userId = await requireUserId();
  const limit = await checkPlanLimit(userId, "clients");
  if (!limit.allowed) {
    return { success: false, error: "Client limit reached. Upgrade to Pro." };
  }

  const parsed = clientSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }

  const client = await db.client.create({
    data: { userId, ...parsed.data, email: parsed.data.email || undefined },
  });

  revalidatePath("/clients");
  return { success: true, data: { id: client.id } };
}

export async function updateClient(id: string, input: unknown): Promise<ActionResult> {
  const userId = await requireUserId();
  const existing = await db.client.findUnique({ where: { id } });
  if (!existing) return { success: false, error: "Client not found" };
  await assertResourceOwnership(userId, existing.userId);

  const parsed = clientSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }

  await db.client.update({
    where: { id },
    data: { ...parsed.data, email: parsed.data.email || null },
  });

  revalidatePath("/clients");
  revalidatePath(`/clients/${id}`);
  return { success: true };
}

export async function deleteClient(id: string): Promise<ActionResult> {
  const userId = await requireUserId();
  const existing = await db.client.findUnique({ where: { id } });
  if (!existing) return { success: false, error: "Client not found" };
  await assertResourceOwnership(userId, existing.userId);

  await db.client.delete({ where: { id } });
  revalidatePath("/clients");
  return { success: true };
}
