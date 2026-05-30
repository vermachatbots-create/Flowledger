"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUserId } from "@/server/auth";
import { checkPlanLimit, assertResourceOwnership } from "@/server/guards";
import { expenseSchema } from "@/validators/expense";
import { Decimal } from "@prisma/client/runtime/library";
import type { ActionResult } from "./auth";

export async function createExpense(input: unknown): Promise<ActionResult<{ id: string }>> {
  const userId = await requireUserId();
  const limit = await checkPlanLimit(userId, "expenses");
  if (!limit.allowed) {
    return { success: false, error: "Expense limit reached. Upgrade to Pro." };
  }

  const parsed = expenseSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }

  const expense = await db.expense.create({
    data: {
      userId,
      category: parsed.data.category,
      description: parsed.data.description,
      amount: new Decimal(parsed.data.amount),
      vendor: parsed.data.vendor,
      date: parsed.data.date,
      isRecurring: parsed.data.isRecurring,
      recurrence: parsed.data.recurrence,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/expenses");
  return { success: true, data: { id: expense.id } };
}

export async function updateExpense(id: string, input: unknown): Promise<ActionResult> {
  const userId = await requireUserId();
  const existing = await db.expense.findUnique({ where: { id } });
  if (!existing) return { success: false, error: "Expense not found" };
  await assertResourceOwnership(userId, existing.userId);

  const parsed = expenseSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }

  await db.expense.update({
    where: { id },
    data: {
      category: parsed.data.category,
      description: parsed.data.description,
      amount: new Decimal(parsed.data.amount),
      vendor: parsed.data.vendor,
      date: parsed.data.date,
      isRecurring: parsed.data.isRecurring,
      recurrence: parsed.data.recurrence,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/expenses");
  return { success: true };
}

export async function deleteExpense(id: string): Promise<ActionResult> {
  const userId = await requireUserId();
  const existing = await db.expense.findUnique({ where: { id } });
  if (!existing) return { success: false, error: "Expense not found" };
  await assertResourceOwnership(userId, existing.userId);

  await db.expense.delete({ where: { id } });
  revalidatePath("/dashboard");
  revalidatePath("/expenses");
  return { success: true };
}
