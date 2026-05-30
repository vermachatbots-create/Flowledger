import { requireUserId } from "@/server/auth";
import {
  getDashboardMetrics,
  getRevenueChartData,
  getExpenseBreakdown,
} from "@/services/analytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { ExpensePieChart } from "@/components/dashboard/expense-pie-chart";
import { formatCurrency } from "@/lib/utils";

export const metadata = { title: "Analytics" };

export default async function AnalyticsPage() {
  const userId = await requireUserId();
  const [metrics, revenueData, expenseBreakdown] = await Promise.all([
    getDashboardMetrics(userId),
    getRevenueChartData(userId, 12),
    getExpenseBreakdown(userId),
  ]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Analytics</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Deep dive into your business performance
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Health Score", value: `${metrics.healthScore}/100` },
          { label: "Revenue Growth", value: `${metrics.revenueGrowth.toFixed(1)}%` },
          { label: "Net Profit", value: formatCurrency(metrics.netProfit) },
          { label: "Forecast", value: formatCurrency(metrics.revenueForecast) },
        ].map((stat) => (
          <Card key={stat.label} className="rounded-2xl p-6">
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className="text-2xl font-bold mt-1">{stat.value}</p>
          </Card>
        ))}
      </div>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>12-Month Revenue Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <RevenueChart data={revenueData} />
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Expense Categories (This Month)</CardTitle>
        </CardHeader>
        <CardContent>
          <ExpensePieChart data={expenseBreakdown} />
        </CardContent>
      </Card>
    </div>
  );
}
