import { useState } from "react";
import { ChevronLeft, ChevronRight, Image as ImageIcon } from "lucide-react";

/**
 * Simple image carousel for product cards
 * Shows navigation dots and arrows on hover
 *
 * @param {Object} props
 * @param {string[]} props.images - Array of image URLs
 * @param {string} [props.alt] - Alt text for images
 * @param {string} [props.className] - Additional classes
 * @param {Function} [props.onImageClick] - Callback when image is clicked (receives currentIndex)
 */
export function ImageCarousel({
  images = [],
  alt = "Producto",
  className = "",
  onImageClick,
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Handle empty or invalid images
  const validImages = images.filter(Boolean);
  const hasMultiple = validImages.length > 1;
  const hasImages = validImages.length > 0;

  const handlePrevious = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? validImages.length - 1 : prev - 1));
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === validImages.length - 1 ? 0 : prev + 1));
  };

  const goToSlide = (e, index) => {
    e.stopPropagation();
    setCurrentIndex(index);
  };

  const handleImageClick = (e) => {
    e.stopPropagation();
    if (onImageClick) {
      onImageClick(currentIndex);
    }
  };

  if (!hasImages) {
    return (
      <div
        className={`flex items-center justify-center bg-(--color-bg-secondary) ${className}`}
      >
        <ImageIcon className="w-16 h-16 text-(--color-fg-muted)" />
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Main Image */}
      <img
        src={validImages[currentIndex]}
        alt={`${alt} - Imagen ${currentIndex + 1}`}
        className={`w-full h-full object-cover transition-transform duration-500 ${onImageClick ? "cursor-pointer" : ""}`}
        onClick={handleImageClick}
      />

      {/* Navigation Arrows (only on hover and if multiple images) */}
      {hasMultiple && (
        <>
          <button
            type="button"
            onClick={handlePrevious}
            className={`absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 hover:bg-black/70 backdrop-blur-sm text-white rounded-full flex items-center justify-center transition-all opacity-100 lg:opacity-0 lg:group-hover:opacity-100`}
            aria-label="Imagen anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            className={`absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 hover:bg-black/70 backdrop-blur-sm text-white rounded-full flex items-center justify-center transition-all opacity-100 lg:opacity-0 lg:group-hover:opacity-100`}
            aria-label="Siguiente imagen"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Dots Indicator (hide on very small items if needed, but here fine) */}
      {hasMultiple && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 bg-black/30 backdrop-blur-sm rounded-full px-2 py-1.5 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
          {validImages.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={(e) => goToSlide(e, index)}
              className={`w-2 h-2 rounded-full transition-all shadow-sm ${
                index === currentIndex
                  ? "bg-white w-4 shadow-md"
                  : "bg-white/60 hover:bg-white/90"
              }`}
              aria-label={`Ir a imagen ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Image Counter (visible always if multiple, moved to bottom-right) */}
      {hasMultiple && (
        <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold rounded-full z-10 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity flex items-center justify-center min-w-[32px]">
          {currentIndex + 1} / {validImages.length}
        </div>
      )}
    </div>
  );
}
