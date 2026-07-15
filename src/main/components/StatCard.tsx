/** Small dashboard stat tile. */
import type { ReactNode } from "react";
import { motion } from "framer-motion";

export function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass flex flex-col items-center gap-1 px-4 py-5"
    >
      <span className="text-2xl" aria-hidden>{icon}</span>
      <span className="font-cute text-2xl font-bold text-aqua-500">{value}</span>
      <span className="text-xs font-medium uppercase tracking-wide opacity-60">{label}</span>
    </motion.div>
  );
}
