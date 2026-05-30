import { inngest } from "./client";
import { db } from "@/lib/db";
import { InvoiceStatus } from "@prisma/client";
import { sendInvoiceReminderEmail, sendWeeklyReportEmail } from "@/lib/email";
import { generateInvoiceNumber } from "@/lib/utils";
import { addWeeks, addMonths, addQuarters, addYears } from "date-fns";

export const sendInvoiceReminder = inngest.createFunction(
  { id: "send-invoice-reminder" },
  { cron: "0 9 * * *" },
  async () => {
    const overdue = await db.invoice.findMany({
      where: {
        status: InvoiceStatus.OVERDUE,
      },
      include: {
        user: { select: { email: true, name: true } },
        client: { select: { name: true, email: true } },
      },
      take: 50,
    });

    for (const invoice of overdue) {
      if (invoice.user.email) {
        await sendInvoiceReminderEmail({
          to: invoice.user.email,
          userName: invoice.user.name ?? "there",
          invoiceNumber: invoice.invoiceNumber,
          amount: invoice.total.toString(),
          clientName: invoice.client?.name,
        });
      }
    }

    return { reminded: overdue.length };
  }
);

export const processRecurringInvoices = inngest.createFunction(
  { id: "process-recurring-invoices" },
  { cron: "0 6 * * *" },
  async () => {
    const today = new Date();
    const recurring = await db.invoice.findMany({
      where: {
        isRecurring: true,
        nextIssueDate: { lte: today },
        status: { not: InvoiceStatus.CANCELLED },
      },
      include: { items: true },
    });

    let created = 0;

    for (const invoice of recurring) {
      await db.invoice.create({
        data: {
          userId: invoice.userId,
          clientId: invoice.clientId,
          invoiceNumber: generateInvoiceNumber(),
          issueDate: today,
          dueDate: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000),
          status: InvoiceStatus.DRAFT,
          notes: invoice.notes,
          currency: invoice.currency,
          taxRate: invoice.taxRate,
          subtotal: invoice.subtotal,
          taxAmount: invoice.taxAmount,
          total: invoice.total,
          isRecurring: false,
          items: {
            create: invoice.items.map((item) => ({
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              total: item.total,
            })),
          },
        },
      });

      const nextDate = getNextIssueDate(today, invoice.recurrence);
      await db.invoice.update({
        where: { id: invoice.id },
        data: { nextIssueDate: nextDate },
      });

      created++;
    }

    return { created };
  }
);

function getNextIssueDate(
  from: Date,
  recurrence: string | null
): Date {
  switch (recurrence) {
    case "WEEKLY":
      return addWeeks(from, 1);
    case "QUARTERLY":
      return addQuarters(from, 1);
    case "YEARLY":
      return addYears(from, 1);
    default:
      return addMonths(from, 1);
  }
}

export const generateWeeklyReport = inngest.createFunction(
  { id: "generate-weekly-report" },
  { cron: "0 8 * * 1" },
  async () => {
    const users = await db.user.findMany({
      where: { email: { not: null } },
      select: { id: true, email: true, name: true },
      take: 100,
    });

    for (const user of users) {
      if (!user.email) continue;

      const paid = await db.invoice.aggregate({
        where: {
          userId: user.id,
          status: InvoiceStatus.PAID,
          paidAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
        _sum: { total: true },
      });

      const expenses = await db.expense.aggregate({
        where: {
          userId: user.id,
          date: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
        _sum: { amount: true },
      });

      await sendWeeklyReportEmail({
        to: user.email,
        userName: user.name ?? "there",
        revenue: paid._sum.total?.toString() ?? "0",
        expenses: expenses._sum.amount?.toString() ?? "0",
      });
    }

    return { sent: users.length };
  }
);
