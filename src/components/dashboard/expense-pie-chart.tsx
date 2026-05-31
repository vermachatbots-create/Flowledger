"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { formatCurrency } from "@/lib/utils";
import { CHART_TOOLTIP_STYLE, PIE_COLORS } from "@/components/dashboard/chart-styles";

interface ExpensePieChartProps {
  data: { category: string; amount: number }[];
}

export function ExpensePieChart({ data }: ExpensePieChartProps) {
  if (!data.length) {
    return (
      <div className="flex h-[280px] items-center justify-center text-sm text-slate-500">
        No expenses this month
      </div>
    );
  }

  const chartData = data.map((d) => ({
    name: d.category.charAt(0) + d.category.slice(1).toLowerCase(),
    value: d.amount,
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={64}
          outerRadius={92}
          paddingAngle={3}
          dataKey="value"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={2}
        >
          {chartData.map((_, index) => (
            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number) => formatCurrency(value)}
          contentStyle={CHART_TOOLTIP_STYLE}
        />
        <Legend
          wrapperStyle={{ fontSize: "11px" }}
          formatter={(value) => (
            <span style={{ color: "rgba(148, 163, 184, 0.85)" }}>{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
