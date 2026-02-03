import { motion } from "motion/react";
import { DollarSign, Image as ImageIcon } from "lucide-react";
import { getProductImageUrl } from "@/shared/services/productService";

export function ProductCard({ product, index }) {
  // Handle both new imageFileIds array and legacy imageFileId
  const firstImageId =
    Array.isArray(product.imageFileIds) && product.imageFileIds.length > 0
      ? product.imageFileIds[0]
      : product.imageFileId;
  const imageUrl = firstImageId ? getProductImageUrl(firstImageId) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="bg-[var(--color-card)] border border-[var(--color-card-border)] rounded-2xl overflow-hidden hover:border-[var(--color-primary)] hover:shadow-lg transition-all"
    >
      {/* Image */}
      <div className="aspect-square bg-[var(--color-bg-secondary)] flex items-center justify-center">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <ImageIcon className="w-16 h-16 text-[var(--color-fg-muted)]" />
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-[var(--color-fg)] mb-2 line-clamp-2 min-h-[3rem]">
          {product.name}
        </h3>

        {/* Price */}
        <div className="flex items-center gap-1 mb-3">
          <DollarSign className="w-5 h-5 text-[var(--color-fg-secondary)]" />
          <span className="text-2xl font-bold text-[var(--color-primary)]">
            {product.price.toLocaleString("es-MX", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
          <span className="text-sm text-[var(--color-fg-secondary)]">
            {product.currency || "MXN"}
          </span>
        </div>

        {/* Description */}
        {product.description && (
          <p className="text-sm text-[var(--color-fg-secondary)] line-clamp-3">
            {product.description}
          </p>
        )}
      </div>
    </motion.div>
  );
}
