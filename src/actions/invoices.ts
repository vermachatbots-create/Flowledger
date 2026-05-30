"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUserId } from "@/server/auth";
import { checkPlanLimit, assertResourceOwnership } from "@/server/guards";
import { invoiceSchema } from "@/validators/invoice";
import { generateInvoiceNumber } from "@/lib/utils";
import { InvoiceStatus } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import type { ActionResult } from "./auth";

function calculateTotals(items: { quantity: number; unitPrice: number }[], taxRate: number) {
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount;
  return { subtotal, taxAmount, total };
}

export async function createInvoice(
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  const userId = await requireUserId();
  const limit = await checkPlanLimit(userId, "invoices");
  if (!limit.allowed) {
    return {
      success: false,
      error: `Invoice limit reached (${limit.current}/${limit.limit}). Upgrade to Pro.`,
    };
  }

  const parsed = invoiceSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }

  const { subtotal, taxAmount, total } = calculateTotals(
    parsed.data.items,
    parsed.data.taxRate
  );

  const invoice = await db.invoice.create({
    data: {
      userId,
      clientId: parsed.data.clientId ?? undefined,
      invoiceNumber: generateInvoiceNumber(),
      issueDate: parsed.data.issueDate,
      dueDate: parsed.data.dueDate,
      notes: parsed.data.notes,
      currency: parsed.data.currency,
      taxRate: new Decimal(parsed.data.taxRate),
      subtotal: new Decimal(subtotal),
      taxAmount: new Decimal(taxAmount),
      total: new Decimal(total),
      status: parsed.data.status as InvoiceStatus,
      isRecurring: parsed.data.isRecurring,
      recurrence: parsed.data.recurrence,
      items: {
        create: parsed.data.items.map((item) => ({
          description: item.description,
          quantity: new Decimal(item.quantity),
          unitPrice: new Decimal(item.unitPrice),
          total: new Decimal(item.quantity * item.unitPrice),
        })),
      },
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/invoices");
  return { success: true, data: { id: invoice.id } };
}

export async function updateInvoice(
  id: string,
  input: unknown
): Promise<ActionResult> {
  const userId = await requireUserId();
  const existing = await db.invoice.findUnique({ where: { id } });
  if (!existing) return { success: false, error: "Invoice not found" };
  await assertResourceOwnership(userId, existing.userId);

  const parsed = invoiceSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }

  const { subtotal, taxAmount, total } = calculateTotals(
    parsed.data.items,
    parsed.data.taxRate
  );

  await db.$transaction([
    db.invoiceItem.deleteMany({ where: { invoiceId: id } }),
    db.invoice.update({
      where: { id },
      data: {
        clientId: parsed.data.clientId ?? null,
        issueDate: parsed.data.issueDate,
        dueDate: parsed.data.dueDate,
        notes: parsed.data.notes,
        currency: parsed.data.currency,
        taxRate: new Decimal(parsed.data.taxRate),
        subtotal: new Decimal(subtotal),
        taxAmount: new Decimal(taxAmount),
        total: new Decimal(total),
        status: parsed.data.status as InvoiceStatus,
        isRecurring: parsed.data.isRecurring,
        recurrence: parsed.data.recurrence,
        items: {
          create: parsed.data.items.map((item) => ({
            description: item.description,
            quantity: new Decimal(item.quantity),
            unitPrice: new Decimal(item.unitPrice),
            total: new Decimal(item.quantity * item.unitPrice),
          })),
        },
      },
    }),
  ]);

  revalidatePath("/dashboard");
  revalidatePath("/invoices");
  revalidatePath(`/invoices/${id}`);
  return { success: true };
}

export async function markInvoicePaid(id: string): Promise<ActionResult> {
  const userId = await requireUserId();
  const invoice = await db.invoice.findUnique({ where: { id } });
  if (!invoice) return { success: false, error: "Invoice not found" };
  await assertResourceOwnership(userId, invoice.userId);

  await db.invoice.update({
    where: { id },
    data: {
      status: InvoiceStatus.PAID,
      paidAt: new Date(),
      paidAmount: invoice.total,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/invoices");
  return { success: true };
}

export async function duplicateInvoice(id: string): Promise<ActionResult<{ id: string }>> {
  const userId = await requireUserId();
  const limit = await checkPlanLimit(userId, "invoices");
  if (!limit.allowed) {
    return { success: false, error: "Invoice limit reached. Upgrade your plan." };
  }

  const original = await db.invoice.findUnique({
    where: { id },
    include: { items: true },
  });
  if (!original) return { success: false, error: "Invoice not found" };
  await assertResourceOwnership(userId, original.userId);

  const duplicate = await db.invoice.create({
    data: {
      userId,
      clientId: original.clientId,
      invoiceNumber: generateInvoiceNumber(),
      issueDate: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      notes: original.notes,
      currency: original.currency,
      taxRate: original.taxRate,
      subtotal: original.subtotal,
      taxAmount: original.taxAmount,
      total: original.total,
      status: InvoiceStatus.DRAFT,
      items: {
        create: original.items.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.total,
        })),
      },
    },
  });

  revalidatePath("/invoices");
  return { success: true, data: { id: duplicate.id } };
}

export async function deleteInvoice(id: string): Promise<ActionResult> {
  const userId = await requireUserId();
  const invoice = await db.invoice.findUnique({ where: { id } });
  if (!invoice) return { success: false, error: "Invoice not found" };
  await assertResourceOwnership(userId, invoice.userId);

  await db.invoice.delete({ where: { id } });
  revalidatePath("/dashboard");
  revalidatePath("/invoices");
  return { success: true };
}
