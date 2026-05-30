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
        <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
        <XAxis dataKey="date" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis
          tick={{ fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `$${v}`}
        />
        <Tooltip
          formatter={(value: number) => formatCurrency(value)}
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "12px",
          }}
        />
        <ReferenceLine y={0} stroke="hsl(var(--border))" />
        <Bar dataKey="inflow" fill="#10b981" radius={[4, 4, 0, 0]} name="Inflow" />
        <Bar dataKey="outflow" fill="#ef4444" radius={[4, 4, 0, 0]} name="Outflow" />
      </BarChart>
    </ResponsiveContainer>
  );
}
