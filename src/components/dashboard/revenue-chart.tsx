"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { formatCurrency } from "@/lib/utils";
import { CHART_TOOLTIP_STYLE, FINTECH_CHART_COLORS } from "@/components/dashboard/chart-styles";

interface RevenueChartProps {
  data: { month: string; revenue: number; expenses: number; profit: number }[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={FINTECH_CHART_COLORS.revenue} stopOpacity={0.4} />
            <stop offset="95%" stopColor={FINTECH_CHART_COLORS.revenue} stopOpacity={0} />
          </linearGradient>
          <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={FINTECH_CHART_COLORS.expenses} stopOpacity={0.3} />
            <stop offset="95%" stopColor={FINTECH_CHART_COLORS.expenses} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={FINTECH_CHART_COLORS.grid} strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 12, fill: FINTECH_CHART_COLORS.axis }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 12, fill: FINTECH_CHART_COLORS.axis }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
        />
        <Tooltip
          contentStyle={CHART_TOOLTIP_STYLE}
          formatter={(value: number) => [formatCurrency(value), ""]}
          labelStyle={{ color: "rgba(148, 163, 184, 0.9)" }}
        />
        <Legend
          wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }}
          formatter={(value) => (
            <span style={{ color: "rgba(148, 163, 184, 0.9)" }}>{value}</span>
          )}
        />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke={FINTECH_CHART_COLORS.revenue}
          fill="url(#revenueGrad)"
          strokeWidth={2}
          name="Revenue"
        />
        <Area
          type="monotone"
          dataKey="expenses"
          stroke={FINTECH_CHART_COLORS.expenses}
          fill="url(#expenseGrad)"
          strokeWidth={2}
          name="Expenses"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
