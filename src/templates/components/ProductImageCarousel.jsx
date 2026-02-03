/**
 * ProductImageCarousel Component
 *
 * Carousel de imágenes optimizado para tarjetas de productos en el catálogo público.
 * Soporta gestos de swipe en móvil y navegación con flechas en desktop.
 */

import { useState, useRef } from "react";
import { ChevronLeft, ChevronRight, Image as ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

/**
 * URL base para imágenes de productos
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
 * @param {Object} props
 * @param {string[]} props.imageFileIds - Array de IDs de archivos de imagen
 * @param {string} [props.legacyImageFileId] - ID legacy para compatibilidad
 * @param {string} [props.alt] - Alt text para las imágenes
 * @param {string} [props.className] - Classes adicionales para el contenedor
 * @param {Function} [props.onImageClick] - Callback cuando se hace click en una imagen
 * @param {'light'|'dark'|'noir'} [props.tone='light'] - Tema visual
 */
export function ProductImageCarousel({
  imageFileIds = [],
  legacyImageFileId,
  alt = "Producto",
  className = "",
  onImageClick,
  tone = "light",
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Build image URLs from IDs - handle both array and legacy single ID
  const imageUrls = (() => {
    if (Array.isArray(imageFileIds) && imageFileIds.length > 0) {
      return imageFileIds.map(getImageUrl).filter(Boolean);
    }
    if (legacyImageFileId) {
      const url = getImageUrl(legacyImageFileId);
      return url ? [url] : [];
    }
    return [];
  })();

  const hasMultiple = imageUrls.length > 1;
  const hasImages = imageUrls.length > 0;

  // Theme-based styling
  const toneStyles = {
    light: {
      bg: "bg-[var(--muted)]",
      arrow: "bg-white/80 hover:bg-white text-gray-700",
      dot: "bg-gray-400",
      dotActive: "bg-white",
      icon: "text-[var(--muted-foreground)]",
    },
    dark: {
      bg: "bg-[var(--color-bg-secondary)]",
      arrow: "bg-black/50 hover:bg-black/70 text-white",
      dot: "bg-white/40",
      dotActive: "bg-white",
      icon: "text-[var(--color-fg-muted)]",
    },
    noir: {
      bg: "bg-[var(--noir-surface-2)]",
      arrow:
        "bg-[var(--noir-surface)]/80 hover:bg-[var(--noir-surface)] text-white border border-[var(--noir-border)]",
      dot: "bg-white/30",
      dotActive: "bg-white",
      icon: "text-[var(--noir-muted)]",
    },
  };

  const styles = toneStyles[tone] || toneStyles.light;

  const handlePrevious = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? imageUrls.length - 1 : prev - 1));
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === imageUrls.length - 1 ? 0 : prev + 1));
  };

  const goToSlide = (e, index) => {
    e.stopPropagation();
    setCurrentIndex(index);
  };

  // Touch handlers for swipe
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!hasMultiple) return;
    const diff = touchStartX.current - touchEndX.current;
    const threshold = 50;

    if (diff > threshold) {
      // Swipe left -> next
      setCurrentIndex((prev) => (prev === imageUrls.length - 1 ? 0 : prev + 1));
    } else if (diff < -threshold) {
      // Swipe right -> prev
      setCurrentIndex((prev) => (prev === 0 ? imageUrls.length - 1 : prev - 1));
    }
  };

  const handleImageClick = (e) => {
    e.stopPropagation();
    if (onImageClick) {
      onImageClick(currentIndex, imageUrls);
    }
  };

  if (!hasImages) {
    return (
      <div
        className={`flex items-center justify-center ${styles.bg} ${className}`}
      >
        <ImageIcon className={`w-12 h-12 ${styles.icon}`} />
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Main Image with animation */}
      <AnimatePresence mode="wait">
        <motion.img
          key={currentIndex}
          src={imageUrls[currentIndex]}
          alt={`${alt} - Imagen ${currentIndex + 1}`}
          className={`w-full h-full object-cover ${onImageClick ? "cursor-pointer" : ""}`}
          onClick={handleImageClick}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          loading="lazy"
        />
      </AnimatePresence>

      {/* Navigation Arrows (only on hover and if multiple images) */}
      {hasMultiple && (
        <>
          <button
            type="button"
            onClick={handlePrevious}
            className={`absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center transition-all ${styles.arrow} ${
              isHovered ? "opacity-100" : "opacity-0"
            }`}
            aria-label="Imagen anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            className={`absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center transition-all ${styles.arrow} ${
              isHovered ? "opacity-100" : "opacity-0"
            }`}
            aria-label="Siguiente imagen"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {hasMultiple && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 bg-black/30 backdrop-blur-sm rounded-full px-2 py-1.5">
          {imageUrls.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={(e) => goToSlide(e, index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex
                  ? `${styles.dotActive} w-4`
                  : `${styles.dot} hover:bg-white/70`
              }`}
              aria-label={`Ir a imagen ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Image Counter (visible on hover if multiple) */}
      {hasMultiple && isHovered && (
        <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 backdrop-blur-sm text-white text-xs font-medium rounded-full">
          {currentIndex + 1} / {imageUrls.length}
        </div>
      )}
    </div>
  );
}
