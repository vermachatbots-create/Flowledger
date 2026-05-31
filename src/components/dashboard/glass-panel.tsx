"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassPanelProps {
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  delay?: number;
  hover?: boolean;
  as?: "section" | "div";
}

export function GlassPanel({
  children,
  className,
  contentClassName,
  delay = 0,
  hover = true,
  as = "section",
}: GlassPanelProps) {
  const Component = motion[as];

  return (
    <Component
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      whileHover={hover ? { y: -3, transition: { duration: 0.25 } } : undefined}
      className={cn("glass-panel group", hover && "glass-panel-hover", className)}
    >
      <div className="glass-panel-shine" aria-hidden />
      <div className={cn("relative", contentClassName)}>{children}</div>
    </Component>
  );
}
