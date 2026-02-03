import { motion } from "motion/react";

export function StepCard({ number, title, description, image }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="text-center"
    >
      <div className="relative mb-6">
        <img
          src={image}
          alt={title}
          className="w-full h-48 object-cover rounded-2xl"
        />
        <div className="absolute -top-4 -left-4 w-12 h-12 bg-[var(--color-primary)] rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
          {number}
        </div>
      </div>
      <h3 className="text-xl font-semibold text-[var(--color-fg)] mb-2">
        {title}
      </h3>
      <p className="text-[var(--color-fg-secondary)]">{description}</p>
    </motion.div>
  );
}
