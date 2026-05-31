"use client";

import { motion } from "framer-motion";
import { DashboardBackground } from "@/components/dashboard/dashboard-background";

interface DashboardShellProps {
  children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <div className="relative min-h-full">
      <DashboardBackground />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10"
      >
        {children}
      </motion.div>
    </div>
  );
}
