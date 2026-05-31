import { requireUserId } from "@/server/auth";
import {
  getDashboardMetrics,
  getRevenueChartData,
  getExpenseBreakdown,
  getCashFlowData,
  markOverdueInvoices,
} from "@/services/analytics";
import { getLatestInsight } from "@/services/ai-insights";
import { db } from "@/lib/db";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { AiInsightCard } from "@/components/dashboard/ai-insight-card";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { ExpensePieChart } from "@/components/dashboard/expense-pie-chart";
import { CashFlowChart } from "@/components/dashboard/cash-flow-chart";
import { RecentInvoices } from "@/components/dashboard/recent-invoices";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { GlassChartCard } from "@/components/dashboard/glass-chart-card";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const userId = await requireUserId();
  await markOverdueInvoices(userId);

  const [metrics, revenueData, expenseBreakdown, cashFlow, insight, recentInvoices] =
    await Promise.all([
      getDashboardMetrics(userId),
      getRevenueChartData(userId),
      getExpenseBreakdown(userId),
      getCashFlowData(userId),
      getLatestInsight(userId),
      db.invoice.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { client: { select: { name: true } } },
      }),
    ]);

  return (
    <DashboardShell>
      <div className="mx-auto max-w-7xl space-y-8 px-1 pb-10 sm:px-2">
        <header className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-indigo-400/80">
            Overview
          </p>
          <h2 className="text-gradient text-2xl font-semibold tracking-tight sm:text-3xl">
            Financial Overview
          </h2>
          <p className="max-w-xl text-sm text-slate-500">
            Real-time snapshot of your business health — revenue, burn, and liquidity at a glance.
          </p>
        </header>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <KpiCard
            title="Monthly Revenue"
            value={metrics.monthlyRevenue}
            change={metrics.revenueGrowth}
            icon="dollar"
            index={0}
          />
          <KpiCard
            title="Burn Rate"
            value={metrics.burnRate}
            change={metrics.expenseGrowth}
            icon="flame"
            index={1}
          />
          <KpiCard
            title="Net Profit"
            value={metrics.netProfit}
            icon="trendingUp"
            index={2}
          />
          <KpiCard
            title="Outstanding"
            value={metrics.outstanding}
            icon="fileWarning"
            index={3}
          />
          <KpiCard
            title="Cash Reserve"
            value={metrics.cashReserve}
            icon="wallet"
            index={4}
          />
          <KpiCard
            title="Revenue Forecast"
            value={metrics.revenueForecast}
            icon="lineChart"
            index={5}
          />
        </div>

        <AiInsightCard initialContent={insight?.content} score={insight?.score} />

        <div className="grid gap-5 lg:grid-cols-3 lg:gap-6">
          <GlassChartCard
            title="Revenue vs Expenses"
            subtitle="Six-month performance"
            className="lg:col-span-2"
            delay={0.35}
          >
            <RevenueChart data={revenueData} />
          </GlassChartCard>

          <GlassChartCard
            title="Expense Breakdown"
            subtitle="Current month by category"
            delay={0.4}
          >
            <ExpensePieChart data={expenseBreakdown} />
          </GlassChartCard>
        </div>

        <div className="grid gap-5 lg:grid-cols-2 lg:gap-6">
          <GlassChartCard title="Cash Flow" subtitle="Daily inflows & outflows" delay={0.45}>
            <CashFlowChart data={cashFlow} />
          </GlassChartCard>

          <GlassChartCard
            title="Recent Invoices"
            delay={0.5}
            headerRight={
              <span className="rounded-lg border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-xs font-medium tabular-nums text-slate-400">
                Health {metrics.healthScore}/100
              </span>
            }
          >
            <RecentInvoices invoices={recentInvoices} />
          </GlassChartCard>
        </div>
      </div>
    </DashboardShell>
  );
}
