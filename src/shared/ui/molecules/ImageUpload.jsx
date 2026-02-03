import { useState, useRef, useEffect } from "react";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@/shared/ui/atoms/Button";

/**
 * Image upload component
 * @param {Object} props
 * @param {string} [props.currentImageUrl] - Current image URL
 * @param {Function} props.onUpload - Upload handler (receives File)
 * @param {Function} [props.onRemove] - Remove handler
 * @param {boolean} [props.isUploading] - Upload loading state
 * @param {string} [props.label] - Label text
 * @param {string} [props.accept] - Accepted file types
 * @param {number} [props.maxSizeMB] - Max file size in MB
 */
export function ImageUpload({
  currentImageUrl,
  onUpload,
  onRemove,
  isUploading = false,
  label = "Imagen",
  accept = "image/png,image/jpeg,image/jpg,image/webp",
  maxSizeMB = 5,
  onImageClick,
}) {
  const [preview, setPreview] = useState(currentImageUrl || null);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    setPreview(currentImageUrl);
  }, [currentImageUrl]);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");

    // Validate file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setError(`El archivo no debe superar ${maxSizeMB}MB`);
      return;
    }

    // Validate file type
    if (!accept.split(",").some((type) => file.type === type.trim())) {
      setError("Formato de archivo no válido");
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result);
    };
    reader.readAsDataURL(file);

    // Call upload handler
    onUpload(file);
  };

  const handleRemove = () => {
    setPreview(null);
    setError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (onRemove) {
      onRemove();
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div>
      <label className="block text-sm font-medium text-[var(--color-fg)] mb-2">
        {label}
      </label>

      {preview ? (
        <div className="relative w-full max-w-xs">
          <div
            className={`relative aspect-square rounded-xl overflow-hidden border-2 border-[var(--color-card-border)] bg-[var(--color-bg-secondary)] ${onImageClick ? "cursor-pointer" : ""}`}
            onClick={() => onImageClick && onImageClick(preview)}
          >
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            {/* Hover Overlay for View Hint if clickable */}
            {onImageClick && !isUploading && (
              <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center group">
                <div className="opacity-0 group-hover:opacity-100 bg-black/60 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm transition-opacity">
                  Ver imagen
                </div>
              </div>
            )}

            {isUploading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              </div>
            )}
          </div>

          {!isUploading && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRemove();
              }}
              className="absolute -top-2 -right-2 w-8 h-8 bg-[var(--color-error)] text-white rounded-full flex items-center justify-center hover:bg-[var(--color-error)]/90 transition-colors shadow-lg z-10"
              aria-label="Eliminar imagen"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={handleClick}
          disabled={isUploading}
          className="w-full max-w-xs aspect-square rounded-xl border-2 border-dashed border-[var(--color-border)] hover:border-[var(--color-primary)] bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-tertiary)] transition-colors flex flex-col items-center justify-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUploading ? (
            <Loader2 className="w-12 h-12 text-[var(--color-fg-muted)] animate-spin" />
          ) : (
            <>
              <div className="w-16 h-16 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center group-hover:bg-[var(--color-primary)]/20 transition-colors">
                <ImageIcon className="w-8 h-8 text-[var(--color-primary)]" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-[var(--color-fg)]">
                  Subir imagen
                </p>
                <p className="text-xs text-[var(--color-fg-secondary)] mt-1">
                  PNG, JPG, WEBP (máx. {maxSizeMB}MB)
                </p>
              </div>
            </>
          )}
        </button>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
        disabled={isUploading}
      />

      {error && (
        <p className="mt-2 text-sm text-[var(--color-error)]">{error}</p>
      )}
    </div>
  );
}
