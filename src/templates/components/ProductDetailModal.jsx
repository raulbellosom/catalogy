import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Share2,
  Package,
  CreditCard,
  Search,
  ZoomIn,
  ZoomOut,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { shareProduct } from "./catalogHooks";
import { getProductImageUrl } from "@/shared/services/productService";

const formatPrice = (price, currency = "MXN") => {
  if (typeof price !== "number") return "";
  return price.toLocaleString("es-MX", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export function ProductDetailModal({
  product,
  isOpen,
  onClose,
  store,
  tone = "light",
}) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [zoom, setZoom] = useState(1);
  const isNoir = tone === "noir";

  // Resolve settings for colors
  const settings = store?.settings
    ? typeof store.settings === "string"
      ? JSON.parse(store.settings)
      : store.settings
    : {};
  const primary = settings?.colors?.primary || "#3b82f6"; // Default blue-600
  // const secondary = settings?.colors?.secondary || "#eff6ff";

  useEffect(() => {
    if (isOpen) {
      setCurrentIdx(0);
      setZoom(1);
      // Lock scroll
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
      document.body.style.overflow = "hidden";
    } else {
      // Unlock scroll
      const scrollY = document.body.style.top;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.overflow = "";
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || "0") * -1);
      }
    }
  }, [isOpen, product]);

  if (!product) return null;

  const panelBase = isNoir
    ? "bg-[var(--noir-surface)] text-[var(--noir-strong)] border-[var(--noir-border)]"
    : "bg-white text-slate-900 border-slate-200";

  const mutedText = isNoir ? "text-[var(--noir-muted)]" : "text-slate-500";
  // Dynamic Accent Color
  const accentColor = isNoir ? "text-(--noir-accent)" : "";
  const surface2 = isNoir ? "bg-(--noir-surface-2)" : "bg-slate-100";

  const imageFileIds = Array.isArray(product.imageFileIds)
    ? product.imageFileIds
    : [];
  const imageUrls = imageFileIds.map(getProductImageUrl).filter(Boolean);

  const nextImg = () => {
    setCurrentIdx((prev) => (prev + 1) % imageUrls.length);
    setZoom(1);
  };
  const prevImg = () => {
    setCurrentIdx((prev) => (prev - 1 + imageUrls.length) % imageUrls.length);
    setZoom(1);
  };

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.5, 3));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.5, 1));

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 md:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            style={{ "--modal-primary": primary }}
            className={`relative w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-3xl border shadow-2xl flex flex-col md:flex-row ${panelBase}`}
          >
            {/* Close Button - Subtle X */}
            <button
              onClick={onClose}
              className={`absolute right-4 top-4 z-110 p-2 rounded-full transition-colors ${
                isNoir
                  ? "text-(--noir-muted) hover:text-(--noir-strong) hover:bg-white/10"
                  : "text-gray-400 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              <X className="w-6 h-6" />
            </button>

            {/* Left Column: Images (White Background Gallery) */}
            <div className="w-full md:w-3/5 min-h-[500px] md:h-[600px] flex flex-col md:flex-row bg-white p-4 md:p-10 relative gap-4 md:gap-6">
              {/* Thumbnails */}
              {imageUrls.length > 1 && (
                <div className="order-2 md:order-1 flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto md:overflow-x-hidden pb-2 md:pb-0 md:pr-2 custom-scrollbar w-full md:w-24 md:h-full shrink-0">
                  {imageUrls.map((url, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setCurrentIdx(idx);
                        setZoom(1);
                      }}
                      className={`relative shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        idx === currentIdx
                          ? isNoir
                            ? "border-(--noir-accent) shadow-md scale-95 md:scale-100 ring-2 ring-offset-1"
                            : "shadow-md scale-95 md:scale-100 ring-2 ring-offset-1 ring-black/5"
                          : "border-transparent opacity-60 hover:opacity-100"
                      }`}
                      style={
                        idx === currentIdx && !isNoir
                          ? { borderColor: primary, ringColor: primary }
                          : {}
                      }
                    >
                      <img
                        src={url}
                        alt="Thumbnail"
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Main Image Viewport */}
              <div className="order-1 md:order-2 flex-1 relative flex items-center justify-center overflow-hidden rounded-2xl bg-gray-50 border border-slate-100 h-64 md:h-auto">
                <AnimatePresence mode="wait">
                  {imageUrls.length > 0 ? (
                    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                      <motion.img
                        key={currentIdx}
                        src={imageUrls[currentIdx]}
                        alt={`${product.name} - ${currentIdx + 1}`}
                        className="w-full h-full object-contain cursor-grab active:cursor-grabbing transition-transform duration-200"
                        style={{ transform: `scale(${zoom})` }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        drag={zoom > 1}
                        dragConstraints={{
                          left: -100 * zoom,
                          right: 100 * zoom,
                          top: -100 * zoom,
                          bottom: 100 * zoom,
                        }}
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-4 text-gray-300">
                      <Package className="w-20 h-20" />
                      <span className="text-sm font-medium">Sin imágenes</span>
                    </div>
                  )}
                </AnimatePresence>

                {imageUrls.length > 1 && (
                  <>
                    <button
                      onClick={prevImg}
                      className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white text-gray-800 transition-colors shadow-sm backdrop-blur-sm z-10"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={nextImg}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white text-gray-800 transition-colors shadow-sm backdrop-blur-sm z-10"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}

                {/* Zoom Controls */}
                <div className="absolute bottom-4 right-4 flex gap-2 z-10">
                  <button
                    onClick={handleZoomOut}
                    disabled={zoom <= 1}
                    className="p-2 rounded-full bg-white/90 shadow-md border border-gray-100 text-gray-700 hover:text-black disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition-all"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleZoomIn}
                    disabled={zoom >= 3}
                    className="p-2 rounded-full bg-white/90 shadow-md border border-gray-100 text-gray-700 hover:text-black disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition-all"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Info */}
            <div className="w-full md:w-2/5 flex flex-col p-6 md:p-8 overflow-y-auto">
              <div className="flex-1 space-y-6">
                {/* Header */}
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {product.categories?.map((cat) => (
                      <span
                        key={cat.id}
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${surface2} ${accentColor}`}
                      >
                        {cat.name}
                      </span>
                    ))}
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                    {product.name}
                  </h2>
                  <div className="flex items-center gap-2 text-2xl font-bold">
                    <span
                      className={accentColor}
                      style={!isNoir ? { color: primary } : {}}
                    >
                      {formatPrice(product.price, product.currency)}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-3">
                  <h3
                    className={`text-xs font-bold uppercase tracking-[0.2em] ${mutedText}`}
                  >
                    Descripción
                  </h3>
                  <p
                    className={`text-sm leading-relaxed ${isNoir ? "text-(--noir-strong)/90" : "text-slate-700"}`}
                  >
                    {product.description || "Sin descripción disponible."}
                  </p>
                </div>

                {/* Details Section - Premium Design */}
                <div
                  className={`pt-6 border-t ${isNoir ? "border-(--noir-border)" : "border-slate-100"} flex flex-col gap-6`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <Package
                          className={`w-4 h-4 ${accentColor}`}
                          style={!isNoir ? { color: primary } : {}}
                        />
                        <span
                          className={`text-[10px] font-bold uppercase tracking-widest ${mutedText}`}
                        >
                          Unidades Disponibles
                        </span>
                      </div>
                      <p className="text-xl font-black">
                        {product.stock ?? "0"}
                      </p>
                    </div>

                    <button
                      onClick={() => shareProduct(product)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${isNoir ? "border-(--noir-border) hover:border-(--noir-accent)" : "border-slate-200"} ${surface2} transition-all group`}
                      style={!isNoir ? { borderColor: "rgba(0,0,0,0.1)" } : {}}
                    >
                      <Share2
                        className={`w-4 h-4 group-hover:scale-110 transition-transform ${accentColor}`}
                        style={!isNoir ? { color: primary } : {}}
                      />
                      <span
                        className={`text-xs font-bold ${accentColor}`}
                        style={!isNoir ? { color: primary } : {}}
                      >
                        Compartir
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Section */}
              {store?.paymentLink && (
                <div
                  className={`mt-8 pt-6 border-t ${isNoir ? "border-(--noir-border)" : "border-slate-100"}`}
                >
                  <a
                    href={store.paymentLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-bold transition-all hover:scale-[1.02] active:scale-[0.98] ${
                      isNoir
                        ? "bg-(--noir-accent) text-black hover:bg-white"
                        : "bg-(--modal-primary) text-white hover:opacity-90"
                    }`}
                  >
                    Comprar ahora
                    <ExternalLink className="w-5 h-5" />
                  </a>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
