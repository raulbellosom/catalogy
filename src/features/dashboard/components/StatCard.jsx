import { motion } from "motion/react";

/**
 * Stat card
 */
export function StatCard({ icon: Icon, label, value, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="p-6 bg-[var(--color-card)] border border-[var(--color-card-border)] rounded-2xl"
    >
      <div className="flex items-center gap-3 mb-2">
        <Icon className="w-5 h-5 text-[var(--color-fg-muted)]" />
        <span className="text-sm text-[var(--color-fg-secondary)]">
          {label}
        </span>
      </div>
      <p className="text-2xl font-bold text-[var(--color-fg)]">{value}</p>
    </motion.div>
  );
}
