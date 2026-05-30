import { db } from "@/lib/db";
import { openai, AI_MODEL, CFO_SYSTEM_PROMPT } from "@/lib/openai";
import { InvoiceStatus } from "@prisma/client";
import { subDays, format } from "date-fns";

function decimalToNumber(value: { toString(): string }): number {
  return parseFloat(value.toString());
}

export async function buildFinancialContext(userId: string) {
  const thirtyDaysAgo = subDays(new Date(), 30);
  const sixtyDaysAgo = subDays(new Date(), 60);

  const [recentInvoices, recentExpenses, overdueInvoices, priorExpenses] =
    await Promise.all([
      db.invoice.findMany({
        where: { userId, issueDate: { gte: thirtyDaysAgo } },
        select: {
          total: true,
          status: true,
          issueDate: true,
          dueDate: true,
          invoiceNumber: true,
        },
      }),
      db.expense.findMany({
        where: { userId, date: { gte: thirtyDaysAgo } },
        select: { amount: true, category: true, description: true, date: true },
      }),
      db.invoice.findMany({
        where: {
          userId,
          status: InvoiceStatus.OVERDUE,
        },
        select: { total: true, dueDate: true, invoiceNumber: true },
      }),
      db.expense.findMany({
        where: {
          userId,
          date: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
        },
        select: { amount: true, category: true },
      }),
    ]);

  const revenue30d = recentInvoices
    .filter((i) => i.status === InvoiceStatus.PAID)
    .reduce((s, i) => s + decimalToNumber(i.total), 0);

  const expenses30d = recentExpenses.reduce(
    (s, e) => s + decimalToNumber(e.amount),
    0
  );

  const expensesPrior30d = priorExpenses.reduce(
    (s, e) => s + decimalToNumber(e.amount),
    0
  );

  const pendingReceivables = recentInvoices
    .filter((i) =>
      [InvoiceStatus.SENT, InvoiceStatus.VIEWED, InvoiceStatus.OVERDUE].includes(
        i.status
      )
    )
    .reduce((s, i) => s + decimalToNumber(i.total), 0);

  const expenseByCategory = recentExpenses.reduce(
    (acc, e) => {
      const cat = e.category;
      acc[cat] = (acc[cat] ?? 0) + decimalToNumber(e.amount);
      return acc;
    },
    {} as Record<string, number>
  );

  const expenseChangePct =
    expensesPrior30d > 0
      ? (((expenses30d - expensesPrior30d) / expensesPrior30d) * 100).toFixed(1)
      : "N/A";

  return {
    period: `${format(thirtyDaysAgo, "MMM d")} – ${format(new Date(), "MMM d, yyyy")}`,
    revenue30d: revenue30d.toFixed(2),
    expenses30d: expenses30d.toFixed(2),
    netCashFlow: (revenue30d - expenses30d).toFixed(2),
    pendingReceivables: pendingReceivables.toFixed(2),
    overdueCount: overdueInvoices.length,
    overdueTotal: overdueInvoices
      .reduce((s, i) => s + decimalToNumber(i.total), 0)
      .toFixed(2),
    expenseChangePct,
    topExpenseCategories: Object.entries(expenseByCategory)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([cat, amt]) => `${cat}: $${amt.toFixed(2)}`)
      .join(", "),
    invoiceCount: recentInvoices.length,
    paidCount: recentInvoices.filter((i) => i.status === InvoiceStatus.PAID)
      .length,
  };
}

export async function generateAiInsight(userId: string): Promise<{
  content: string;
  score: number;
}> {
  const context = await buildFinancialContext(userId);

  const userPrompt = `Analyze this business financial snapshot and provide one actionable CFO insight:

Period: ${context.period}
Revenue (30d): $${context.revenue30d}
Expenses (30d): $${context.expenses30d}
Net cash flow: $${context.netCashFlow}
Pending receivables: $${context.pendingReceivables}
Overdue invoices: ${context.overdueCount} ($${context.overdueTotal})
Expense change vs prior 30d: ${context.expenseChangePct}%
Top expense categories: ${context.topExpenseCategories || "None"}
Invoices: ${context.paidCount}/${context.invoiceCount} paid`;

  const completion = await openai.chat.completions.create({
    model: AI_MODEL,
    temperature: 0.3,
    max_tokens: 200,
    messages: [
      { role: "system", content: CFO_SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ],
  });

  const content =
    completion.choices[0]?.message?.content?.trim() ??
    "Unable to generate insight. Please try again later.";

  const score = calculateInsightScore(context);

  await db.aiInsight.create({
    data: { userId, content, score },
  });

  return { content, score };
}

function calculateInsightScore(context: {
  netCashFlow: string;
  overdueCount: number;
  expenseChangePct: string;
}): number {
  let score = 75;
  const net = parseFloat(context.netCashFlow);
  if (net < 0) score -= 25;
  if (context.overdueCount > 2) score -= 15;
  const change = parseFloat(context.expenseChangePct);
  if (!isNaN(change) && change > 20) score -= 10;
  return Math.max(0, Math.min(100, score));
}

export async function getLatestInsight(userId: string) {
  return db.aiInsight.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}
