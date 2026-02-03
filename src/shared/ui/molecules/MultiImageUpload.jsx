import { useState, useRef, useEffect } from "react";
import {
  Upload,
  X,
  Image as ImageIcon,
  Loader2,
  Plus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useToast } from "./Toast";

const MAX_IMAGES = 4;

/**
 * Multi-image upload component with carousel preview
 * Supports up to 4 images with main preview and thumbnails
 *
 * @param {Object} props
 * @param {string[]} [props.currentImageUrls] - Current image URLs array
 * @param {Function} props.onUpload - Upload handler (receives File, returns Promise with fileId)
 * @param {Function} [props.onRemove] - Remove handler (receives index)
 * @param {boolean} [props.isUploading] - Upload loading state
 * @param {string} [props.label] - Label text
 * @param {string} [props.accept] - Accepted file types
 * @param {number} [props.maxSizeMB] - Max file size in MB
 */
export function MultiImageUpload({
  currentImageUrls = [],
  onUpload,
  onRemove,
  isUploading = false,
  label = "Imágenes del Producto",
  accept = "image/png,image/jpeg,image/jpg,image/webp",
  maxSizeMB = 10,
}) {
  const toast = useToast();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [previews, setPreviews] = useState(currentImageUrls || []);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setPreviews(currentImageUrls || []);
    // Reset selected index if current selection is out of bounds
    if (selectedIndex >= (currentImageUrls?.length || 0)) {
      setSelectedIndex(Math.max(0, (currentImageUrls?.length || 1) - 1));
    }
  }, [currentImageUrls]);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    // Validate file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      toast.error(`El archivo no debe superar ${maxSizeMB}MB`);
      return;
    }

    // Validate file type
    if (!accept.split(",").some((type) => file.type === type.trim())) {
      toast.error("Formato de archivo no válido");
      return;
    }

    // Check max images
    if (previews.length >= MAX_IMAGES) {
      toast.error(`Máximo ${MAX_IMAGES} imágenes permitidas`);
      return;
    }

    // Call upload handler
    await onUpload(file);
  };

  const handleRemove = (index) => {
    if (onRemove) {
      onRemove(index);
    }
    // Adjust selected index if needed
    if (selectedIndex >= previews.length - 1 && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    }
  };

  const handleClick = () => {
    if (previews.length >= MAX_IMAGES) {
      toast.info(
        `Máximo ${MAX_IMAGES} imágenes. Elimina una para agregar otra.`,
      );
      return;
    }
    fileInputRef.current?.click();
  };

  const handlePrevious = () => {
    setSelectedIndex((prev) => (prev === 0 ? previews.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setSelectedIndex((prev) => (prev === previews.length - 1 ? 0 : prev + 1));
  };

  const hasImages = previews.length > 0;
  const canAddMore = previews.length < MAX_IMAGES;

  return (
    <div className="space-y-4">
      {label && (
        <label className="block text-sm font-bold text-(--color-fg) tracking-tight uppercase">
          {label}
        </label>
      )}

      {/* Main Preview Area */}
      <div className="relative aspect-square w-full rounded-2xl overflow-hidden border-2 border-(--color-card-border) bg-(--color-bg-secondary)">
        {hasImages ? (
          <>
            {/* Main Image */}
            <img
              src={previews[selectedIndex]}
              alt={`Imagen ${selectedIndex + 1}`}
              className="w-full h-full object-cover"
            />

            {/* Navigation Arrows (only if more than 1 image) */}
            {previews.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrevious}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 backdrop-blur-sm text-white rounded-full flex items-center justify-center transition-all"
                  aria-label="Imagen anterior"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 backdrop-blur-sm text-white rounded-full flex items-center justify-center transition-all"
                  aria-label="Siguiente imagen"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {/* Remove Button for Selected Image */}
            {!isUploading && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(selectedIndex);
                }}
                className="absolute top-3 right-3 w-8 h-8 bg-(--color-error) text-white rounded-full flex items-center justify-center hover:bg-(--color-error)/90 transition-colors shadow-lg z-10"
                aria-label="Eliminar imagen"
              >
                <X className="w-5 h-5" />
              </button>
            )}

            {/* Image Counter Badge */}
            <div className="absolute top-3 left-3 px-3 py-1 bg-black/60 backdrop-blur-sm text-white text-xs font-medium rounded-full">
              {selectedIndex + 1} / {previews.length}
            </div>

            {/* Loading Overlay */}
            {isUploading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-white animate-spin" />
              </div>
            )}
          </>
        ) : (
          /* Empty State - Upload Prompt */
          <button
            type="button"
            onClick={handleClick}
            disabled={isUploading}
            className="w-full h-full flex flex-col items-center justify-center gap-3 group hover:bg-(--color-bg-tertiary) transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? (
              <Loader2 className="w-12 h-12 text-(--color-fg-muted) animate-spin" />
            ) : (
              <>
                <div className="w-20 h-20 rounded-full bg-(--color-primary)/10 flex items-center justify-center group-hover:bg-(--color-primary)/20 transition-colors">
                  <ImageIcon className="w-10 h-10 text-(--color-primary)" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-(--color-fg)">
                    Subir imágenes
                  </p>
                  <p className="text-xs text-(--color-fg-secondary) mt-1">
                    PNG, JPG, WEBP (máx. {maxSizeMB}MB)
                  </p>
                  <p className="text-xs text-(--color-fg-muted) mt-1">
                    Hasta {MAX_IMAGES} imágenes
                  </p>
                </div>
              </>
            )}
          </button>
        )}
      </div>

      {/* Thumbnails Row */}
      <div className="flex gap-3">
        {/* Existing Thumbnails */}
        {previews.map((url, index) => (
          <div
            key={index}
            className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 cursor-pointer ${
              index === selectedIndex
                ? "border-(--color-primary) ring-2 ring-(--color-primary)/30"
                : "border-(--color-card-border) hover:border-(--color-primary)/50"
            }`}
            onClick={() => setSelectedIndex(index)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && setSelectedIndex(index)}
          >
            <img
              src={url}
              alt={`Miniatura ${index + 1}`}
              className="w-full h-full object-cover"
            />
            {/* Mini remove button on hover */}
            <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(index);
                }}
                className="w-6 h-6 bg-(--color-error) text-white rounded-full flex items-center justify-center"
                aria-label="Eliminar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {/* Add More Button (if less than MAX_IMAGES) */}
        {canAddMore && (
          <button
            type="button"
            onClick={handleClick}
            disabled={isUploading}
            className="w-16 h-16 rounded-xl border-2 border-dashed border-(--color-border) hover:border-(--color-primary) bg-(--color-bg-secondary) hover:bg-(--color-bg-tertiary) transition-all flex items-center justify-center flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
            title={`Agregar imagen (${previews.length}/${MAX_IMAGES})`}
          >
            {isUploading ? (
              <Loader2 className="w-5 h-5 text-(--color-fg-muted) animate-spin" />
            ) : (
              <Plus className="w-6 h-6 text-(--color-fg-muted)" />
            )}
          </button>
        )}

        {/* Empty slots indicator */}
        {previews.length > 0 && previews.length < MAX_IMAGES && (
          <div className="flex items-center">
            <span className="text-xs text-(--color-fg-muted)">
              {MAX_IMAGES - previews.length} más
            </span>
          </div>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
        disabled={isUploading}
      />
    </div>
  );
}
