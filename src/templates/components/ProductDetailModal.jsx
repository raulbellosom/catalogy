import { useState, useEffect, useMemo, useRef, useCallback } from "react";
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
import { resolveThemeSettings } from "@/templates/registry";
import { isColorDark, getContrastRatio } from "@/shared/utils/colorExtraction";

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
  panelBgColor, // Optional: override background color for contrast calculation
  showShareButton = true,
  showPaymentButton = true,
}) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const isDark = tone === "noir" || tone === "prism";
  const isNature = tone === "nature";

  // Refs for gesture handling
  const imageContainerRef = useRef(null);
  const lastTouchRef = useRef({ x: 0, y: 0 });
  const touchStartDistRef = useRef(null);
  const initialPinchScaleRef = useRef(1);
  const lastTapRef = useRef(0);

  useEffect(() => {
    if (isOpen) {
      setCurrentIdx(0);
      setZoom(1);
      setPosition({ x: 0, y: 0 });
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

  // Resolve settings for colors - MUST be before any conditional returns
  const theme = resolveThemeSettings(store);
  const primary = theme.colors.primary;
  const secondary = theme.colors.secondary;

  // Detect if panel background needs light text for contrast
  const panelBackground = panelBgColor || secondary || "#ffffff";
  const needsLightText = useMemo(() => {
    if (isDark) return true;
    try {
      const bgIsDark = isColorDark(panelBackground);
      const contrastWithDark = getContrastRatio(panelBackground, "#1e293b");
      const contrastWithLight = getContrastRatio(panelBackground, "#ffffff");
      if (bgIsDark && contrastWithLight > contrastWithDark) return true;
      if (contrastWithDark < 4.5 && contrastWithLight >= 4.5) return true;
      return false;
    } catch {
      return false;
    }
  }, [panelBackground, isDark]);

  // ALL useCallback hooks MUST be defined before any conditional returns
  const resetView = useCallback(() => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  const handleDoubleTap = useCallback(() => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      if (zoom > 1) {
        resetView();
      } else {
        setZoom(2);
      }
    }
    lastTapRef.current = now;
  }, [zoom, resetView]);

  const handleWheel = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    const delta = e.ctrlKey ? -e.deltaY * 0.01 : -e.deltaY * 0.003;
    setZoom((s) => {
      const newZoom = Math.min(3, Math.max(1, s + delta));
      if (newZoom === 1) setPosition({ x: 0, y: 0 });
      return newZoom;
    });
  }, []);

  const handleTouchStart = useCallback(
    (e) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY,
        );
        touchStartDistRef.current = dist;
        initialPinchScaleRef.current = zoom;
      } else if (e.touches.length === 1) {
        lastTouchRef.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
        };
        if (zoom > 1) {
          setIsDragging(true);
        }
      }
    },
    [zoom],
  );

  const handleTouchMove = useCallback(
    (e) => {
      if (e.touches.length === 2 && touchStartDistRef.current) {
        e.preventDefault();
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY,
        );
        const scaleFactor = dist / touchStartDistRef.current;
        const newScale = Math.min(
          3,
          Math.max(1, initialPinchScaleRef.current * scaleFactor),
        );
        setZoom(newScale);
        if (newScale === 1) setPosition({ x: 0, y: 0 });
      } else if (e.touches.length === 1 && isDragging && zoom > 1) {
        e.preventDefault();
        const deltaX = e.touches[0].clientX - lastTouchRef.current.x;
        const deltaY = e.touches[0].clientY - lastTouchRef.current.y;
        setPosition((prev) => ({
          x: prev.x + deltaX,
          y: prev.y + deltaY,
        }));
        lastTouchRef.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
        };
      }
    },
    [isDragging, zoom],
  );

  const handleTouchEnd = useCallback(() => {
    touchStartDistRef.current = null;
    setIsDragging(false);
  }, []);

  const handleMouseDown = useCallback(
    (e) => {
      if (zoom > 1) {
        e.preventDefault();
        lastTouchRef.current = { x: e.clientX, y: e.clientY };
        setIsDragging(true);
      }
    },
    [zoom],
  );

  const handleMouseMove = useCallback(
    (e) => {
      if (isDragging && zoom > 1) {
        const deltaX = e.clientX - lastTouchRef.current.x;
        const deltaY = e.clientY - lastTouchRef.current.y;
        setPosition((prev) => ({
          x: prev.x + deltaX,
          y: prev.y + deltaY,
        }));
        lastTouchRef.current = { x: e.clientX, y: e.clientY };
      }
    },
    [isDragging, zoom],
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const imageContainerCallbackRef = useCallback(
    (node) => {
      if (imageContainerRef.current) {
        imageContainerRef.current.removeEventListener("wheel", handleWheel);
        imageContainerRef.current.removeEventListener(
          "touchstart",
          handleTouchStart,
        );
        imageContainerRef.current.removeEventListener(
          "touchmove",
          handleTouchMove,
        );
        imageContainerRef.current.removeEventListener(
          "touchend",
          handleTouchEnd,
        );
      }
      imageContainerRef.current = node;
      if (node) {
        node.addEventListener("wheel", handleWheel, { passive: false });
        node.addEventListener("touchstart", handleTouchStart, {
          passive: false,
        });
        node.addEventListener("touchmove", handleTouchMove, { passive: false });
        node.addEventListener("touchend", handleTouchEnd, { passive: false });
      }
    },
    [handleWheel, handleTouchStart, handleTouchMove, handleTouchEnd],
  );

  // Early return AFTER all hooks are defined
  if (!product) return null;

  const panelBase = needsLightText
    ? isDark
      ? "bg-(--noir-surface) text-(--noir-strong) border-(--noir-border)"
      : "text-white border-white/20" // Auto-contrast mode: light text
    : "bg-(--color-bg) text-slate-900 border-slate-200/50";

  const mutedText = needsLightText
    ? isDark
      ? "text-(--noir-muted)"
      : "text-white/70" // Auto-contrast: muted light text
    : isNature
      ? "text-green-800/60"
      : "text-slate-500";

  // Dynamic Accent Color
  const accentColor = needsLightText
    ? isDark
      ? "text-(--noir-accent)"
      : "text-white" // Auto-contrast: white accent
    : isNature
      ? "text-(--modal-primary)"
      : "";

  const surface2 = needsLightText
    ? isDark
      ? "bg-(--noir-surface-2)"
      : "bg-white/10" // Auto-contrast: subtle light surface
    : isNature
      ? "bg-green-50/50"
      : "bg-slate-100";

  const imageFileIds = Array.isArray(product.imageFileIds)
    ? product.imageFileIds
    : [];
  const imageUrls = imageFileIds.map(getProductImageUrl).filter(Boolean);

  const nextImg = () => {
    setCurrentIdx((prev) => (prev + 1) % imageUrls.length);
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };
  const prevImg = () => {
    setCurrentIdx((prev) => (prev - 1 + imageUrls.length) % imageUrls.length);
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.5, 3));
  const handleZoomOut = () => {
    setZoom((z) => {
      const newZoom = Math.max(z - 0.5, 1);
      if (newZoom === 1) setPosition({ x: 0, y: 0 });
      return newZoom;
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-3 sm:p-4 md:p-6">
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
            style={{
              "--modal-primary": primary,
              "--modal-bg": secondary,
              colorScheme: needsLightText ? "dark" : "light",
              // When auto-contrast is active, use the secondary color as background
              ...(needsLightText && !isDark
                ? { backgroundColor: secondary }
                : {}),
            }}
            className={`relative w-full max-w-5xl max-h-[calc(100vh-24px)] sm:max-h-[calc(100vh-32px)] md:max-h-[85vh] overflow-hidden rounded-2xl sm:rounded-3xl border shadow-2xl flex flex-col md:flex-row ${panelBase}`}
          >
            {/* Close Button - Subtle X */}
            <button
              onClick={onClose}
              className={`absolute right-4 top-4 z-110 p-2 rounded-full transition-colors ${
                needsLightText
                  ? "text-white/60 hover:text-white hover:bg-white/10"
                  : "text-gray-400 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              <X className="w-6 h-6" />
            </button>

            {/* Left Column: Images (White Background Gallery) */}
            <div className="w-full md:w-3/5 h-[320px] sm:h-[380px] md:h-auto md:min-h-[500px] flex flex-col md:flex-row bg-white p-3 sm:p-4 md:p-10 relative gap-3 md:gap-6 shrink-0 md:shrink">
              {/* Thumbnails */}
              {imageUrls.length > 1 && (
                <div className="order-2 md:order-1 flex md:flex-col gap-2 sm:gap-3 overflow-x-auto md:overflow-y-auto md:overflow-x-hidden pb-2 md:pb-0 md:pr-2 custom-scrollbar w-full md:w-24 md:h-full shrink-0">
                  {imageUrls.map((url, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setCurrentIdx(idx);
                        resetView();
                      }}
                      className={`relative shrink-0 w-12 h-12 sm:w-14 sm:h-14 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        idx === currentIdx
                          ? isDark
                            ? "border-(--noir-accent) shadow-md scale-95 md:scale-100 ring-2 ring-offset-1"
                            : "shadow-md scale-95 md:scale-100 ring-2 ring-offset-1 ring-black/5"
                          : "border-transparent opacity-60 hover:opacity-100"
                      }`}
                      style={
                        idx === currentIdx && !isDark
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

              {/* Main Image Viewport with Gesture Support */}
              <div
                ref={imageContainerCallbackRef}
                className={`order-1 md:order-2 flex-1 relative flex items-center justify-center overflow-hidden rounded-xl sm:rounded-2xl bg-gray-50 border border-slate-100 min-h-[220px] sm:min-h-[280px] md:min-h-0 md:h-auto select-none ${
                  zoom > 1 ? "cursor-grab" : "cursor-default"
                } ${isDragging ? "cursor-grabbing" : ""}`}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onClick={handleDoubleTap}
              >
                <AnimatePresence mode="wait">
                  {imageUrls.length > 0 ? (
                    <motion.img
                      key={currentIdx}
                      src={imageUrls[currentIdx]}
                      alt={`${product.name} - ${currentIdx + 1}`}
                      className="max-w-full max-h-full object-contain pointer-events-none"
                      style={{
                        transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
                        transition: isDragging
                          ? "none"
                          : "transform 0.2s ease-out",
                      }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      draggable={false}
                    />
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
                      className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 sm:p-2 rounded-full bg-white/80 hover:bg-white text-gray-800 transition-colors shadow-sm backdrop-blur-sm z-10"
                    >
                      <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                    <button
                      onClick={nextImg}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 sm:p-2 rounded-full bg-white/80 hover:bg-white text-gray-800 transition-colors shadow-sm backdrop-blur-sm z-10"
                    >
                      <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                  </>
                )}

                {/* Zoom Controls - Always visible */}
                <div className="flex absolute bottom-2 sm:bottom-3 md:bottom-4 right-2 sm:right-3 md:right-4 gap-1.5 sm:gap-2 z-10 items-center">
                  {/* Zoom Level Indicator */}
                  {zoom > 1 && (
                    <span className="px-2 py-1 text-[10px] sm:text-xs font-medium bg-black/70 text-white rounded-full">
                      {Math.round(zoom * 100)}%
                    </span>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleZoomOut();
                    }}
                    disabled={zoom <= 1}
                    className="p-1.5 sm:p-2 rounded-full bg-white/90 shadow-md border border-gray-100 text-gray-700 hover:text-black disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white transition-all active:scale-95"
                  >
                    <ZoomOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleZoomIn();
                    }}
                    disabled={zoom >= 3}
                    className="p-1.5 sm:p-2 rounded-full bg-white/90 shadow-md border border-gray-100 text-gray-700 hover:text-black disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white transition-all active:scale-95"
                  >
                    <ZoomIn className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Info */}
            <div className="w-full md:w-2/5 flex flex-col p-4 sm:p-6 md:p-8 overflow-y-auto flex-1 min-h-0">
              <div className="flex-1 space-y-4 sm:space-y-6">
                {/* Header */}
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {product.categories?.map((cat) => (
                      <span
                        key={cat.id}
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.6 rounded-md shadow-sm border ${
                          needsLightText
                            ? "bg-white/10 text-white/90 border-white/20"
                            : "bg-white text-slate-900 border-slate-100"
                        }`}
                      >
                        {cat.name}
                      </span>
                    ))}
                  </div>
                  <h2
                    className={`text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight ${needsLightText ? "text-white" : "text-slate-900"}`}
                  >
                    {product.name}
                  </h2>
                  <div className="flex items-center gap-2 text-xl sm:text-2xl font-bold">
                    <span
                      className={needsLightText ? "text-white" : ""}
                      style={!needsLightText ? { color: primary } : {}}
                    >
                      {formatPrice(product.price, product.currency)}
                    </span>
                  </div>
                </div>

                {product.description && (
                  <div className="space-y-3">
                    <h3
                      className={`text-xs font-bold uppercase tracking-[0.2em] ${mutedText}`}
                    >
                      Descripcion
                    </h3>
                    <p
                      className={`text-sm leading-relaxed ${needsLightText ? "text-white/90" : "text-slate-700"}`}
                    >
                      {product.description}
                    </p>
                  </div>
                )}

                {/* Details Section - Premium Design */}
                <div
                  className={`pt-4 sm:pt-6 border-t ${needsLightText ? "border-white/20" : "border-slate-100"} flex flex-col gap-4 sm:gap-6`}
                >
                  <div className="flex items-center justify-between gap-4">
                    {typeof product.stock === "number" && (
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <Package
                            className={`w-4 h-4 ${accentColor}`}
                            style={!needsLightText ? { color: primary } : {}}
                          />
                          <span
                            className={`text-[10px] font-bold uppercase tracking-widest ${mutedText}`}
                          >
                            Unidades Disponibles
                          </span>
                        </div>
                        <p
                          className={`text-xl font-black ${needsLightText ? "text-white" : ""}`}
                        >
                          {product.stock}
                        </p>
                      </div>
                    )}

                    {showShareButton && (
                      <button
                        onClick={() => shareProduct(product)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${needsLightText ? "border-white/20 hover:border-white/40" : "border-slate-200"} ${surface2} transition-all group`}
                        style={
                          !needsLightText
                            ? { borderColor: "rgba(0,0,0,0.1)" }
                            : {}
                        }
                      >
                        <Share2
                          className={`w-4 h-4 group-hover:scale-110 transition-transform ${accentColor}`}
                          style={!needsLightText ? { color: primary } : {}}
                        />
                        <span
                          className={`text-xs font-bold ${accentColor}`}
                          style={!needsLightText ? { color: primary } : {}}
                        >
                          Compartir
                        </span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Action Section */}
                {store?.paymentLink && showPaymentButton && (
                  <div
                    className={`mt-6 sm:mt-8 pt-4 sm:pt-6 border-t ${needsLightText ? "border-white/20" : "border-slate-100"}`}
                  >
                    <a
                      href={store.paymentLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-full flex items-center justify-center gap-2 sm:gap-3 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold transition-all hover:scale-[1.02] active:scale-[0.98] text-sm sm:text-base ${
                        needsLightText
                          ? "bg-white text-black hover:bg-white/90"
                          : "bg-(--modal-primary) text-white hover:opacity-90"
                      }`}
                    >
                      Comprar ahora
                      <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
