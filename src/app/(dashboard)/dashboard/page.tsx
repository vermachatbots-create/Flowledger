import {
  DollarSign,
  Flame,
  TrendingUp,
  FileWarning,
  Wallet,
  LineChart,
} from "lucide-react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Financial Overview</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Real-time snapshot of your business health
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard
          title="Monthly Revenue"
          value={metrics.monthlyRevenue}
          change={metrics.revenueGrowth}
          icon={DollarSign}
          index={0}
        />
        <KpiCard
          title="Burn Rate"
          value={metrics.burnRate}
          change={metrics.expenseGrowth}
          icon={Flame}
          index={1}
        />
        <KpiCard
          title="Net Profit"
          value={metrics.netProfit}
          icon={TrendingUp}
          index={2}
        />
        <KpiCard
          title="Outstanding"
          value={metrics.outstanding}
          icon={FileWarning}
          index={3}
        />
        <KpiCard
          title="Cash Reserve"
          value={metrics.cashReserve}
          icon={Wallet}
          index={4}
        />
        <KpiCard
          title="Revenue Forecast"
          value={metrics.revenueForecast}
          icon={LineChart}
          index={5}
        />
      </div>

      <AiInsightCard
        initialContent={insight?.content}
        score={insight?.score}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 rounded-2xl border-border/50">
          <CardHeader>
            <CardTitle>Revenue vs Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueChart data={revenueData} />
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/50">
          <CardHeader>
            <CardTitle>Expense Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ExpensePieChart data={expenseBreakdown} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="rounded-2xl border-border/50">
          <CardHeader>
            <CardTitle>Cash Flow</CardTitle>
          </CardHeader>
          <CardContent>
            <CashFlowChart data={cashFlow} />
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Invoices</CardTitle>
            <span className="text-xs text-muted-foreground">
              Health score: {metrics.healthScore}/100
            </span>
          </CardHeader>
          <CardContent>
            <RecentInvoices invoices={recentInvoices} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
