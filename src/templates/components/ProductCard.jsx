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
import { ProductImageCarousel } from "./ProductImageCarousel";

const formatPrice = (price, currency = "MXN") => {
  if (typeof price !== "number") return "";
  return price.toLocaleString("es-MX", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

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
  onImageClick,
  onShare,
  shared = false,
  tone = "light",
}) {
  const isNoir = tone === "noir";
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
        ${isNoir ? "bg-(--noir-surface) border-(--noir-border) hover:border-(--noir-accent)" : "bg-(--card) border-(--border)"}
        rounded-2xl overflow-hidden
        border shadow-sm hover:shadow-md
        transition-all duration-300
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
          tone={tone}
          onImageClick={onImageClick}
        />
      </div>

      {/* Contenido */}
      <div className="p-4 space-y-2">
        {/* Nombre y Categorias */}
        <div className="space-y-1">
          <h3
            className={`font-bold leading-tight ${isNoir ? "text-(--noir-strong)" : "text-(--foreground)"}`}
          >
            {product.name}
          </h3>
          {product.categories && product.categories.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {product.categories.map((cat) => (
                <span
                  key={cat.id || cat.name}
                  className={`text-[8px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded ${
                    isNoir
                      ? "bg-(--noir-surface-2) text-(--noir-accent)"
                      : "bg-(--primary)/10 text-(--primary)"
                  }`}
                >
                  {cat.name}
                </span>
              ))}
            </div>
          )}
        </div>

        {showDescription && product.description && (
          <p
            className={`text-xs ${isNoir ? "text-(--noir-muted)" : "text-(--muted-foreground)"} line-clamp-2 leading-relaxed`}
          >
            {product.description}
          </p>
        )}

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-baseline gap-1">
            <span
              className={`text-[10px] font-bold ${isNoir ? "text-(--noir-muted)" : "text-(--muted-foreground)"}`}
            >
              MXN
            </span>
            <span
              className={`text-lg font-black ${isNoir ? "text-(--noir-accent)" : "text-(--primary)"}`}
            >
              {formatPrice(product.price, product.currency)}
            </span>
          </div>
          {product.stock !== undefined && (
            <span
              className={`text-[9px] font-bold tracking-tight px-2 py-0.5 rounded-full ${
                isNoir
                  ? "bg-(--noir-surface-2) text-(--noir-muted)/50"
                  : "bg-(--muted) text-(--muted-foreground)"
              }`}
            >
              DISPONIBLES: {product.stock}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
