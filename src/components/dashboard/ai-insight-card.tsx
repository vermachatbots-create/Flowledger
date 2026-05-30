"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { Sparkles, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { refreshAiInsight } from "@/actions/ai";
import { cn } from "@/lib/utils";

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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.5 }}
      className="relative overflow-hidden rounded-3xl glass-card p-6 md:p-8"
    >
      <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute -bottom-12 -left-12 h-32 w-32 rounded-full bg-violet-500/10 blur-3xl" />

      <div className="relative">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/20 to-blue-500/20 border border-white/10">
              <Sparkles className="h-5 w-5 text-violet-400" />
            </div>
            <div>
              <h3 className="font-semibold">AI Financial Insight</h3>
              <p className="text-xs text-muted-foreground">Powered by FlowLedger CFO Engine</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {healthScore !== null && healthScore !== undefined && (
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Health</p>
                <p className="text-lg font-bold">{healthScore}</p>
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isPending}
              className="rounded-xl border-white/10 bg-white/5"
            >
              <RefreshCw className={cn("h-3.5 w-3.5", isPending && "animate-spin")} />
              {isPending ? "Analyzing..." : "Refresh"}
            </Button>
          </div>
        </div>

        <p className="text-sm leading-relaxed text-foreground/90 md:text-base">
          &ldquo;{displayContent}&rdquo;
        </p>

        {error && (
          <p className="mt-3 text-xs text-red-400">{error}</p>
        )}
      </div>
    </motion.div>
  );
}
