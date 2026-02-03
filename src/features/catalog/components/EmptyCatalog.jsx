import { motion } from "motion/react";
import { Store as StoreIcon } from "lucide-react";

export function EmptyCatalog() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-4"
    >
      <div className="w-20 h-20 bg-[var(--color-primary)]/10 rounded-full flex items-center justify-center mb-6">
        <StoreIcon className="w-10 h-10 text-[var(--color-primary)]" />
      </div>
      <h2 className="text-xl font-semibold text-[var(--color-fg)] mb-2">
        Sin productos disponibles
      </h2>
      <p className="text-[var(--color-fg-secondary)] text-center max-w-md">
        Esta tienda aún no tiene productos en su catálogo.
      </p>
    </motion.div>
  );
}
