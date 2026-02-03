/**
 * ProductCard Component
 *
 * Tarjeta de producto reutilizable para todos los templates.
 * Muestra imagen, nombre, descripcion y precio del producto.
 */

import { motion } from "motion/react";
import { Tag, Share2 } from "lucide-react";
import { shareProduct } from "./catalogHooks";
import { getProductImageUrl } from "@/shared/services/productService";

/**
 * @typedef {Object} Product

/**
 * Variantes de tamano para la tarjeta
 */
const sizeVariants = {
  small: "max-w-[160px]",
  medium: "max-w-[240px]",
  large: "max-w-[320px]",
  full: "w-full",
};

/**
 * @param {Object} props
 * @param {Product} props.product - Datos del producto
 * @param {'small'|'medium'|'large'|'full'} [props.size='medium'] - Tamano de la tarjeta
 * @param {boolean} [props.showDescription=true] - Mostrar descripcion
 * @param {Function} [props.onClick] - Handler de click
 * @param {Function} [props.onShare] - Handler de compartir
 * @param {boolean} [props.shared] - Estado de compartido
 */
export function ProductCard({
  product,
  size = "medium",
  showDescription = true,
  onClick,
  onShare,
  shared = false,
}) {
  const handleShare = async (event) => {
    event.stopPropagation();
    if (onShare) {
      onShare(product);
      return;
    }
    await shareProduct(product);
  };

  const imageFileIds = Array.isArray(product.imageFileIds)
    ? product.imageFileIds
    : [];
  const legacyImageFileId = product.imageFileId;

  return (
    <motion.div
      className={`
        ${sizeVariants[size]}
        bg-(--card) rounded-xl overflow-hidden
        border border-(--border)
        shadow-sm hover:shadow-md
        transition-shadow duration-200
        cursor-pointer
      `}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
    >
      {/* Imagen */}
      <div className="aspect-square relative overflow-hidden">
        <button
          type="button"
          onClick={handleShare}
          className="absolute right-2 top-2 z-10 h-8 w-8 rounded-full bg-(--card)/80 border border-(--border) flex items-center justify-center text-(--muted-foreground) hover:text-(--primary)"
          aria-label="Compartir producto"
        >
          <Share2 className="h-4 w-4" />
        </button>
        <ProductImageCarousel
          imageFileIds={imageFileIds}
          legacyImageFileId={legacyImageFileId}
          alt={product.name}
          className="w-full h-full bg-(--muted)"
          tone="light"
        />
      </div>

      {/* Contenido */}
      <div className="p-3 space-y-1">
        <h3 className="font-medium text-(--foreground) line-clamp-1">
          {product.name}
        </h3>

        {showDescription && product.description && (
          <p className="text-sm text-(--muted-foreground) line-clamp-2">
            {product.description}
          </p>
        )}

        <div className="flex items-center gap-1.5 pt-1">
          <Tag className="w-3.5 h-3.5 text-(--primary)" />
          <span className="font-semibold text-(--primary)">
            {formatPrice(product.price, product.currency)}
          </span>
        </div>
        {shared && (
          <span className="text-[10px] uppercase tracking-[0.2em] text-(--muted-foreground)">
            Copiado
          </span>
        )}
      </div>
    </motion.div>
  );
}
