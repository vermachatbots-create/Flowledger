"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LandingHero() {
  return (
    <section className="relative pt-32 pb-20 px-6 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
      <div className="relative mx-auto max-w-4xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-muted/50 px-4 py-1.5 text-sm mb-8">
            <Sparkles className="h-3.5 w-3.5" />
            AI-Powered Financial Intelligence
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1]">
            Invoice smarter.
            <br />
            <span className="text-muted-foreground">Forecast further.</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            FlowLedger helps freelancers, creators, and SMBs manage invoices, track cash flow,
            and receive AI-powered CFO insights — all in one premium workspace.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register">
              <Button variant="glow" size="lg" className="rounded-2xl px-8">
                Start free trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button variant="outline" size="lg" className="rounded-2xl px-8">
                View pricing
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
