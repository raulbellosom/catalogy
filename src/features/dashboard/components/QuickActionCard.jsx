import { motion } from "motion/react";
import { Link } from "react-router-dom";

/**
 * Quick action card
 */
export function QuickActionCard({
  icon: Icon,
  title,
  description,
  to,
  external,
  delay,
}) {
  const content = (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="p-6 bg-[var(--color-card)] border border-[var(--color-card-border)] rounded-2xl hover:border-[var(--color-primary)] transition-colors group cursor-pointer"
    >
      <div className="w-12 h-12 bg-[var(--color-primary)]/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[var(--color-primary)]/20 transition-colors">
        <Icon className="w-6 h-6 text-[var(--color-primary)]" />
      </div>
      <h3 className="font-semibold text-[var(--color-fg)] mb-1">{title}</h3>
      <p className="text-sm text-[var(--color-fg-secondary)]">{description}</p>
    </motion.div>
  );

  if (external) {
    return (
      <a href={to} target="_blank" rel="noopener noreferrer">
        {content}
      </a>
    );
  }

  return <Link to={to}>{content}</Link>;
}
