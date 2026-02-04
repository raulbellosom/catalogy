/**
 * ProductGrid Component
 *
 * Grid responsivo de productos.
 * Configurable para diferentes layouts (lista, grid compacto, grid amplio).
 */

import { motion } from "motion/react";
import { Package } from "lucide-react";
import { ProductCard } from "./ProductCard";

/**
 * Variantes de layout del grid
 */
const gridVariants = {
  list: "flex flex-col gap-4",
  compact:
    "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3",
  standard:
    "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4",
  wide: "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6",
};

/**
 * Mapeo de variante de grid a tamano de card
 */
const cardSizeMap = {
  list: "full",
  compact: "full",
  standard: "full",
  wide: "full",
};

/**
 * Animacion staggered para el grid
 */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

/**
 * @param {Object} props
 * @param {Array} props.products - Lista de productos
 * @param {'list'|'compact'|'standard'|'wide'} [props.variant='standard'] - Variante del grid
 * @param {boolean} [props.showDescription=true] - Mostrar descripcion en cards
 * @param {Function} [props.onProductClick] - Handler de click en producto
 * @param {Function} [props.onShare] - Handler de compartir producto
 * @param {string|null} [props.sharedProductId] - Producto compartido
 * @param {string} [props.emptyMessage] - Texto para estado vacio
 */
export function ProductGrid({
  products = [],
  variant = "standard",
  showDescription = true,
  onProductClick,
  onShare,
  sharedProductId = null,
  emptyMessage,
}) {
  if (!products || products.length === 0) {
    return (
      <div className="py-20 text-center">
        <Package className="w-16 h-16 mx-auto text-[var(--muted-foreground)] mb-4" />
        <h3 className="text-lg font-medium text-[var(--foreground)]">
          Sin productos
        </h3>
        <p className="text-sm text-[var(--muted-foreground)] mt-1">
          {emptyMessage || "Esta tienda aun no tiene productos disponibles"}
        </p>
      </div>
    );
  }

  return (
    <motion.div
      className={gridVariants[variant]}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {products.map((product) => (
        <motion.div key={product.$id} variants={itemVariants}>
          <ProductCard
            product={product}
            size={cardSizeMap[variant]}
            showDescription={showDescription}
            onClick={() => onProductClick?.(product)}
            onShare={onShare}
            shared={sharedProductId === product.$id}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}
