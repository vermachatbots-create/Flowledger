"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { Sparkles, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { refreshAiInsight } from "@/actions/ai";
import { cn } from "@/lib/utils";
import { GlassPanel } from "@/components/dashboard/glass-panel";

interface AiInsightCardProps {
  initialContent?: string | null;
  score?: number | null;
}

export function AiInsightCard({ initialContent, score }: AiInsightCardProps) {
  const [content, setContent] = useState(initialContent);
  const [healthScore, setHealthScore] = useState(score);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleRefresh = () => {
    setError(null);
    startTransition(async () => {
      const result = await refreshAiInsight();
      if (result.success && result.data) {
        setContent(result.data.content);
        setHealthScore(result.data.score);
      } else if (!result.success) {
        setError(result.error);
      }
    });
  };

  const displayContent =
    content ??
    "Connect your financial data and generate your first AI-powered CFO insight. FlowLedger analyzes revenue, expenses, and receivables to surface actionable guidance.";

  return (
    <GlassPanel delay={0.28} className="overflow-hidden rounded-3xl" hover={false}>
      <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-indigo-500/15 blur-3xl" aria-hidden />
      <div className="absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-cyan-500/10 blur-3xl" aria-hidden />

      <div className="relative p-6 md:p-8">
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.03 }}
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-indigo-400/20 bg-gradient-to-br from-indigo-500/25 to-blue-500/15 shadow-[0_0_24px_-6px_rgba(99,102,241,0.4)]"
            >
              <Sparkles className="h-5 w-5 text-indigo-300" />
            </motion.div>
            <div>
              <h3 className="font-semibold text-slate-50">AI Financial Insight</h3>
              <p className="text-xs text-slate-500">Powered by FlowLedger CFO Engine</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {healthScore !== null && healthScore !== undefined && (
              <div className="rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2 text-right backdrop-blur-sm">
                <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
                  Health
                </p>
                <p className="text-xl font-semibold tabular-nums text-slate-50">{healthScore}</p>
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isPending}
              className="rounded-xl border-white/10 bg-white/[0.04] text-slate-200 backdrop-blur-sm hover:border-white/15 hover:bg-white/[0.07]"
            >
              <RefreshCw className={cn("mr-1.5 h-3.5 w-3.5", isPending && "animate-spin")} />
              {isPending ? "Analyzing..." : "Refresh"}
            </Button>
          </div>
        </div>

        <p className="text-sm leading-relaxed text-slate-300 md:text-[15px]">
          &ldquo;{displayContent}&rdquo;
        </p>

        {error && <p className="mt-3 text-xs text-red-400">{error}</p>}
      </div>
    </GlassPanel>
  );
}
