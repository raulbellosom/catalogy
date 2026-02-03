import { motion } from "motion/react";
import { Star } from "lucide-react";

export function TestimonialCard({ quote, author, role }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="p-6 bg-[var(--color-card)] border border-[var(--color-card-border)] rounded-2xl"
    >
      <div className="flex gap-1 mb-4">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
        ))}
      </div>
      <p className="text-[var(--color-fg-secondary)] mb-6 italic">
        &quot;{quote}&quot;
      </p>
      <div>
        <p className="font-semibold text-[var(--color-fg)]">{author}</p>
        <p className="text-sm text-[var(--color-fg-muted)]">{role}</p>
      </div>
    </motion.div>
  );
}
