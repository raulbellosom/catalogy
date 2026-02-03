import { motion } from "motion/react";

export function ShowcaseCard({ image, title, category }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group cursor-pointer"
    >
      <div className="relative overflow-hidden rounded-2xl mb-4">
        <img
          src={image}
          alt={title}
          className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <p className="text-sm text-white/80">{category}</p>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
        </div>
      </div>
    </motion.div>
  );
}
