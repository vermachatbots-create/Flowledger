"use client";

import { motion } from "framer-motion";

export function DashboardBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden lg:left-64">
      <div className="absolute inset-0 bg-[#070b12]" />
      <div className="dashboard-mesh absolute inset-0 opacity-90" />
      <div className="dashboard-noise absolute inset-0" />

      <motion.div
        className="absolute -left-[10%] top-[8%] h-[420px] w-[420px] rounded-full bg-indigo-600/20 blur-[120px]"
        animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute right-[5%] top-[15%] h-[360px] w-[360px] rounded-full bg-blue-500/15 blur-[100px]"
        animate={{ x: [0, -25, 0], y: [0, 25, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[10%] left-[30%] h-[320px] w-[320px] rounded-full bg-cyan-500/10 blur-[110px]"
        animate={{ x: [0, 20, 0], y: [0, -15, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[20%] right-[15%] h-[280px] w-[280px] rounded-full bg-emerald-500/10 blur-[100px]"
        animate={{ x: [0, -15, 0], y: [0, 20, 0] }}
        transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </div>
  );
}
