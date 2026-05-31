"use client";

import { GlassPanel } from "@/components/dashboard/glass-panel";
import { cn } from "@/lib/utils";

interface GlassChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  delay?: number;
  headerRight?: React.ReactNode;
}

export function GlassChartCard({
  title,
  subtitle,
  children,
  className,
  delay = 0,
  headerRight,
}: GlassChartCardProps) {
  return (
    <GlassPanel delay={delay} className={cn("h-full", className)}>
      <div className="border-b border-white/[0.06] px-6 py-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold tracking-tight text-slate-100">{title}</h3>
            {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
          </div>
          {headerRight}
        </div>
      </div>
      <div className="p-6 pt-4">{children}</div>
    </GlassPanel>
  );
}
