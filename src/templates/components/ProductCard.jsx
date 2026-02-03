/**
 * ProductCard Component
 *
 * Tarjeta de producto reutilizable para todos los templates.
 * Muestra imagen, nombre, descripcion y precio del producto.
 */

import { motion } from "motion/react";
import { ImageOff, Tag, Share2 } from "lucide-react";
import { shareProduct } from "./catalogHooks";

/**
 * @typedef {Object} Product
 * @property {string} $id - ID del producto
 * @property {string} name - Nombre del producto
 * @property {string} description - Descripcion del producto
 * @property {number} price - Precio del producto
 * @property {string[]|null} imageFileIds - IDs de archivos de imagen (array)
 * @property {string|null} imageFileId - ID del archivo de imagen (legacy)
 * @property {string} currency - Moneda (default: USD)
 */

/**
 * Formatea un precio con su moneda
 * @param {number} price
 * @param {string} currency
 * @returns {string}
 */
const formatPrice = (price, currency = "USD") => {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency,
  }).format(price);
};

/**
 * URL base para imagenes de productos
 * @param {string} fileId
 * @returns {string}
 */
const getImageUrl = (fileId) => {
  if (!fileId) return null;
  const endpoint = import.meta.env.VITE_APPWRITE_ENDPOINT;
  const projectId = import.meta.env.VITE_APPWRITE_PROJECT_ID;
  return `${endpoint}/storage/buckets/productImages/files/${fileId}/view?project=${projectId}`;
};

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
  // Handle both new imageFileIds array and legacy imageFileId
  const firstImageId =
    Array.isArray(product.imageFileIds) && product.imageFileIds.length > 0
      ? product.imageFileIds[0]
      : product.imageFileId;
  const imageUrl = getImageUrl(firstImageId);
  const handleShare = async (event) => {
    event.stopPropagation();
    if (onShare) {
      onShare(product);
      return;
    }
    await shareProduct(product);
  };

  return (
    <motion.div
      className={`
        ${sizeVariants[size]}
        bg-[var(--card)] rounded-xl overflow-hidden
        border border-[var(--border)]
        shadow-sm hover:shadow-md
        transition-shadow duration-200
        cursor-pointer
      `}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
    >
      {/* Imagen */}
      <div className="aspect-square bg-[var(--muted)] relative overflow-hidden">
        <button
          type="button"
          onClick={handleShare}
          className="absolute right-2 top-2 z-10 h-8 w-8 rounded-full bg-[var(--card)]/80 border border-[var(--border)] flex items-center justify-center text-[var(--muted-foreground)] hover:text-[var(--primary)]"
          aria-label="Compartir producto"
        >
          <Share2 className="h-4 w-4" />
        </button>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[var(--muted-foreground)]">
            <ImageOff className="w-12 h-12" />
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="p-3 space-y-1">
        <h3 className="font-medium text-[var(--foreground)] line-clamp-1">
          {product.name}
        </h3>

        {showDescription && product.description && (
          <p className="text-sm text-[var(--muted-foreground)] line-clamp-2">
            {product.description}
          </p>
        )}

        <div className="flex items-center gap-1.5 pt-1">
          <Tag className="w-3.5 h-3.5 text-[var(--primary)]" />
          <span className="font-semibold text-[var(--primary)]">
            {formatPrice(product.price, product.currency)}
          </span>
        </div>
        {shared && (
          <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--muted-foreground)]">
            Copiado
          </span>
        )}
      </div>
    </motion.div>
  );
}
