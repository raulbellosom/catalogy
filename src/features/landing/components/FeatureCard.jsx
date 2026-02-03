import { motion } from "motion/react";

export function FeatureCard({ icon: Icon, title, description }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="p-6 bg-[var(--color-card)] border border-[var(--color-card-border)] rounded-2xl hover:border-[var(--color-primary)]/30 transition-colors"
    >
      <div className="w-12 h-12 bg-[var(--color-primary)]/10 rounded-xl flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-[var(--color-primary)]" />
      </div>
      <h3 className="text-lg font-semibold text-[var(--color-fg)] mb-2">
        {title}
      </h3>
      <p className="text-[var(--color-fg-secondary)]">{description}</p>
    </motion.div>
  );
}
