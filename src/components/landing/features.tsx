"use client";

import { motion } from "framer-motion";
import { BarChart3, FileText, Brain, Shield } from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "Smart Invoicing",
    description: "Create, send, and track invoices with recurring automation and PDF export.",
  },
  {
    icon: BarChart3,
    title: "Cash Flow Analytics",
    description: "Real-time dashboards with revenue charts, burn rate, and forecasting.",
  },
  {
    icon: Brain,
    title: "AI CFO Insights",
    description: "GPT-powered financial analysis that detects risks before they hit.",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "Multi-tenant isolation, rate limiting, and Stripe-powered billing.",
  },
];

export function LandingFeatures() {
  return (
    <section className="py-20 px-6 border-t border-border/50">
      <div className="mx-auto max-w-6xl grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {features.map((feature, i) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="rounded-2xl border border-border/50 bg-card p-6 hover:shadow-soft transition-shadow"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted mb-4">
              <feature.icon className="h-5 w-5" />
            </div>
            <h3 className="font-semibold mb-2">{feature.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {feature.description}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
