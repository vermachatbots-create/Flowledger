"use client";

import { motion } from "framer-motion";
import {
  DollarSign,
  Flame,
  TrendingUp,
  TrendingDown,
  FileWarning,
  Wallet,
  LineChart,
  type LucideIcon,
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import type { KpiIconName } from "@/components/dashboard/kpi-types";

export type { KpiIconName } from "@/components/dashboard/kpi-types";

const KPI_ICONS: Record<KpiIconName, LucideIcon> = {
  dollar: DollarSign,
  flame: Flame,
  trendingUp: TrendingUp,
  fileWarning: FileWarning,
  wallet: Wallet,
  lineChart: LineChart,
};

const KPI_ACCENTS: Record<
  KpiIconName,
  { glow: string; icon: string; gradient: string }
> = {
  dollar: {
    glow: "group-hover:shadow-[0_0_32px_-8px_rgba(99,102,241,0.45)]",
    icon: "text-indigo-400",
    gradient: "from-indigo-500/20 via-blue-500/10 to-transparent",
  },
  flame: {
    glow: "group-hover:shadow-[0_0_32px_-8px_rgba(251,146,60,0.25)]",
    icon: "text-amber-400/90",
    gradient: "from-amber-500/15 via-orange-500/5 to-transparent",
  },
  trendingUp: {
    glow: "group-hover:shadow-[0_0_32px_-8px_rgba(52,211,153,0.35)]",
    icon: "text-emerald-400",
    gradient: "from-emerald-500/20 via-teal-500/10 to-transparent",
  },
  fileWarning: {
    glow: "group-hover:shadow-[0_0_32px_-8px_rgba(251,191,36,0.25)]",
    icon: "text-amber-300/80",
    gradient: "from-amber-400/15 via-yellow-500/5 to-transparent",
  },
  wallet: {
    glow: "group-hover:shadow-[0_0_32px_-8px_rgba(34,211,238,0.3)]",
    icon: "text-cyan-400",
    gradient: "from-cyan-500/20 via-blue-500/10 to-transparent",
  },
  lineChart: {
    glow: "group-hover:shadow-[0_0_32px_-8px_rgba(129,140,248,0.35)]",
    icon: "text-violet-400",
    gradient: "from-violet-500/20 via-indigo-500/10 to-transparent",
  },
};

interface KpiCardProps {
  title: string;
  value: number;
  format?: "currency" | "number" | "percent";
  change?: number;
  icon: KpiIconName;
  index?: number;
  currency?: string;
}

export function KpiCard({
  title,
  value,
  format = "currency",
  change,
  icon,
  index = 0,
  currency = "USD",
}: KpiCardProps) {
  const Icon = KPI_ICONS[icon];
  const accent = KPI_ACCENTS[icon];

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
      transition={{ delay: index * 0.06, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className={cn("group glass-kpi glass-kpi-hover", accent.glow)}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-0 bg-gradient-to-br opacity-80",
          accent.gradient
        )}
        aria-hidden
      />
      <div className="glass-panel-shine opacity-50" aria-hidden />

      <div className="relative">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-xs font-medium tracking-wide text-slate-400 uppercase">
            {title}
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-sm">
            <Icon className={cn("h-4 w-4", accent.icon)} />
          </div>
        </div>
        <p className="text-2xl font-semibold tracking-tight text-slate-50">{formatted}</p>
        {change !== undefined && (
          <div
            className={cn(
              "mt-2.5 flex items-center gap-1 text-xs font-medium",
              isPositive ? "text-emerald-400" : "text-slate-400"
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
