"use client";

import { motion } from "framer-motion";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";

interface KpiCardProps {
  title: string;
  value: number;
  format?: "currency" | "number" | "percent";
  change?: number;
  icon: LucideIcon;
  index?: number;
  currency?: string;
}

export function KpiCard({
  title,
  value,
  format = "currency",
  change,
  icon: Icon,
  index = 0,
  currency = "USD",
}: KpiCardProps) {
  const formatted =
    format === "currency"
      ? formatCurrency(value, currency)
      : format === "percent"
        ? `${value.toFixed(1)}%`
        : value.toLocaleString();

  const isPositive = change !== undefined && change >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card p-6 shadow-soft hover:shadow-md transition-shadow"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-muted-foreground font-medium">{title}</span>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted">
            <Icon className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
        <p className="text-2xl font-bold tracking-tight">{formatted}</p>
        {change !== undefined && (
          <div
            className={cn(
              "flex items-center gap-1 mt-2 text-xs font-medium",
              isPositive ? "text-emerald-500" : "text-red-400"
            )}
          >
            {isPositive ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            <span>{Math.abs(change).toFixed(1)}% vs last month</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
