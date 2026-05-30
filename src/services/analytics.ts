import { db } from "@/lib/db";
import { InvoiceStatus } from "@prisma/client";
import {
  startOfMonth,
  endOfMonth,
  subMonths,
  format,
  isBefore,
  startOfDay,
} from "date-fns";

function decimalToNumber(value: { toString(): string } | number): number {
  return typeof value === "number" ? value : parseFloat(value.toString());
}

export async function getDashboardMetrics(userId: string) {
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const lastMonthStart = startOfMonth(subMonths(now, 1));
  const lastMonthEnd = endOfMonth(subMonths(now, 1));

  const [invoices, expenses, paidInvoices, overdueInvoices] = await Promise.all([
    db.invoice.findMany({
      where: { userId },
      select: {
        total: true,
        status: true,
        issueDate: true,
        paidAt: true,
        dueDate: true,
      },
    }),
    db.expense.findMany({
      where: { userId },
      select: { amount: true, date: true, category: true },
    }),
    db.invoice.findMany({
      where: {
        userId,
        status: InvoiceStatus.PAID,
        paidAt: { gte: monthStart, lte: monthEnd },
      },
      select: { total: true, paidAt: true },
    }),
    db.invoice.findMany({
      where: {
        userId,
        status: { in: [InvoiceStatus.SENT, InvoiceStatus.VIEWED, InvoiceStatus.OVERDUE] },
        dueDate: { lt: startOfDay(now) },
      },
      select: { total: true },
    }),
  ]);

  const monthlyRevenue = paidInvoices.reduce(
    (sum, inv) => sum + decimalToNumber(inv.total),
    0
  );

  const monthlyExpenses = expenses
    .filter((e) => e.date >= monthStart && e.date <= monthEnd)
    .reduce((sum, e) => sum + decimalToNumber(e.amount), 0);

  const lastMonthExpenses = expenses
    .filter((e) => e.date >= lastMonthStart && e.date <= lastMonthEnd)
    .reduce((sum, e) => sum + decimalToNumber(e.amount), 0);

  const outstanding = invoices
    .filter((i) =>
      [InvoiceStatus.SENT, InvoiceStatus.VIEWED, InvoiceStatus.OVERDUE].includes(
        i.status
      )
    )
    .reduce((sum, inv) => sum + decimalToNumber(inv.total), 0);

  const overdueAmount = overdueInvoices.reduce(
    (sum, inv) => sum + decimalToNumber(inv.total),
    0
  );

  const netProfit = monthlyRevenue - monthlyExpenses;
  const burnRate = monthlyExpenses;
  const cashReserve = monthlyRevenue - burnRate;

  const lastMonthRevenue = invoices
    .filter(
      (i) =>
        i.status === InvoiceStatus.PAID &&
        i.paidAt &&
        i.paidAt >= lastMonthStart &&
        i.paidAt <= lastMonthEnd
    )
    .reduce((sum, inv) => sum + decimalToNumber(inv.total), 0);

  const revenueGrowth =
    lastMonthRevenue > 0
      ? ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
      : 0;

  const expenseGrowth =
    lastMonthExpenses > 0
      ? ((monthlyExpenses - lastMonthExpenses) / lastMonthExpenses) * 100
      : 0;

  const revenueForecast = monthlyRevenue * (1 + revenueGrowth / 100);

  const healthScore = calculateHealthScore({
    monthlyRevenue,
    monthlyExpenses,
    outstanding,
    overdueAmount,
    revenueGrowth,
  });

  return {
    monthlyRevenue,
    burnRate,
    netProfit,
    outstanding,
    overdueAmount,
    cashReserve,
    revenueForecast,
    revenueGrowth,
    expenseGrowth,
    healthScore,
    invoiceCount: invoices.length,
    expenseCount: expenses.length,
  };
}

function calculateHealthScore(params: {
  monthlyRevenue: number;
  monthlyExpenses: number;
  outstanding: number;
  overdueAmount: number;
  revenueGrowth: number;
}): number {
  let score = 70;

  if (params.monthlyRevenue > params.monthlyExpenses) score += 15;
  else score -= 20;

  if (params.revenueGrowth > 0) score += 10;
  else if (params.revenueGrowth < -10) score -= 15;

  if (params.overdueAmount > params.monthlyRevenue * 0.3) score -= 20;
  if (params.outstanding > params.monthlyRevenue * 2) score -= 10;

  return Math.max(0, Math.min(100, Math.round(score)));
}

export async function getRevenueChartData(userId: string, months = 6) {
  const data = [];
  const now = new Date();

  for (let i = months - 1; i >= 0; i--) {
    const date = subMonths(now, i);
    const start = startOfMonth(date);
    const end = endOfMonth(date);

    const paid = await db.invoice.aggregate({
      where: {
        userId,
        status: InvoiceStatus.PAID,
        paidAt: { gte: start, lte: end },
      },
      _sum: { total: true },
    });

    const monthExpenses = await db.expense.aggregate({
      where: { userId, date: { gte: start, lte: end } },
      _sum: { amount: true },
    });

    data.push({
      month: format(date, "MMM"),
      revenue: decimalToNumber(paid._sum.total ?? 0),
      expenses: decimalToNumber(monthExpenses._sum.amount ?? 0),
      profit:
        decimalToNumber(paid._sum.total ?? 0) -
        decimalToNumber(monthExpenses._sum.amount ?? 0),
    });
  }

  return data;
}

export async function getExpenseBreakdown(userId: string) {
  const expenses = await db.expense.groupBy({
    by: ["category"],
    where: {
      userId,
      date: { gte: startOfMonth(new Date()) },
    },
    _sum: { amount: true },
  });

  return expenses.map((e) => ({
    category: e.category,
    amount: decimalToNumber(e._sum.amount ?? 0),
  }));
}

export async function getCashFlowData(userId: string) {
  const invoices = await db.invoice.findMany({
    where: { userId, status: InvoiceStatus.PAID },
    select: { total: true, paidAt: true },
    orderBy: { paidAt: "asc" },
    take: 50,
  });

  const expenses = await db.expense.findMany({
    where: { userId },
    select: { amount: true, date: true },
    orderBy: { date: "asc" },
    take: 50,
  });

  const flows: { date: string; inflow: number; outflow: number }[] = [];

  invoices.forEach((inv) => {
    if (!inv.paidAt) return;
    const key = format(inv.paidAt, "yyyy-MM-dd");
    const existing = flows.find((f) => f.date === key);
    const amount = decimalToNumber(inv.total);
    if (existing) existing.inflow += amount;
    else flows.push({ date: key, inflow: amount, outflow: 0 });
  });

  expenses.forEach((exp) => {
    const key = format(exp.date, "yyyy-MM-dd");
    const existing = flows.find((f) => f.date === key);
    const amount = decimalToNumber(exp.amount);
    if (existing) existing.outflow += amount;
    else flows.push({ date: key, inflow: 0, outflow: amount });
  });

  return flows
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-30)
    .map((f) => ({
      ...f,
      net: f.inflow - f.outflow,
    }));
}

export async function markOverdueInvoices(userId: string) {
  const now = new Date();
  await db.invoice.updateMany({
    where: {
      userId,
      status: { in: [InvoiceStatus.SENT, InvoiceStatus.VIEWED] },
      dueDate: { lt: now },
    },
    data: { status: InvoiceStatus.OVERDUE },
  });
}
