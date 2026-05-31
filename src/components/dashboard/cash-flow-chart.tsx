"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { formatCurrency } from "@/lib/utils";
import { CHART_TOOLTIP_STYLE, FINTECH_CHART_COLORS } from "@/components/dashboard/chart-styles";

interface CashFlowChartProps {
  data: { date: string; inflow: number; outflow: number; net: number }[];
}

export function CashFlowChart({ data }: CashFlowChartProps) {
  const chartData = data.map((d) => ({
    ...d,
    date: d.date.slice(5),
  }));

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid stroke={FINTECH_CHART_COLORS.grid} strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: FINTECH_CHART_COLORS.axis }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: FINTECH_CHART_COLORS.axis }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `$${v}`}
        />
        <Tooltip
          formatter={(value: number) => formatCurrency(value)}
          contentStyle={CHART_TOOLTIP_STYLE}
          labelStyle={{ color: "rgba(148, 163, 184, 0.9)" }}
        />
        <ReferenceLine y={0} stroke="rgba(255,255,255,0.08)" />
        <Bar
          dataKey="inflow"
          fill={FINTECH_CHART_COLORS.inflow}
          radius={[6, 6, 0, 0]}
          name="Inflow"
        />
        <Bar
          dataKey="outflow"
          fill={FINTECH_CHART_COLORS.outflow}
          radius={[6, 6, 0, 0]}
          name="Outflow"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
