"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { formatCurrency } from "@/lib/utils";

const COLORS = [
  "#8b5cf6",
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#ec4899",
  "#06b6d4",
  "#84cc16",
  "#6366f1",
];

interface ExpensePieChartProps {
  data: { category: string; amount: number }[];
}

export function ExpensePieChart({ data }: ExpensePieChartProps) {
  if (!data.length) {
    return (
      <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
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
          innerRadius={60}
          outerRadius={90}
          paddingAngle={4}
          dataKey="value"
        >
          {chartData.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number) => formatCurrency(value)}
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "12px",
          }}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
