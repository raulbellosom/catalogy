import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Share2,
  Package,
  ShoppingCart,
  Minus,
  Plus,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Check,
  ExternalLink,
  MessageCircle,
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
  panelBgColor,
  showShareButton = true,
  showPaymentButton = true,
  onAddToCart, // New prop for Cart integration
}) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [qty, setQty] = useState(1); // Quantity state
  const [justAdded, setJustAdded] = useState(false); // Feedback state
  const isDark = tone === "noir" || tone === "prism";
  const isNature = tone === "nature";

  // Refs for gesture handling
  const imageContainerRef = useRef(null);
  const lastTouchRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (isOpen) {
      setCurrentIdx(0);
      setZoom(1);
      setPosition({ x: 0, y: 0 });
      setQty(1);
      setJustAdded(false);
      // Lock scroll
      document.body.style.overflow = "hidden";
    } else {
      // Unlock scroll
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen, product]);

  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(product, qty);
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 2000);
    }
  };

  // Resolve settings
  const theme = resolveThemeSettings(store);
  const primary = theme.colors.primary;
  const secondary = theme.colors.secondary;

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

  if (!product) return null;

  const imageFileIds = Array.isArray(product.imageFileIds)
    ? product.imageFileIds
    : [];
  const imageUrls = imageFileIds.map(getProductImageUrl).filter(Boolean);

  const nextImg = (e) => {
    e?.stopPropagation();
    setCurrentIdx((prev) => (prev + 1) % imageUrls.length);
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };
  const prevImg = (e) => {
    e?.stopPropagation();
    setCurrentIdx((prev) => (prev - 1 + imageUrls.length) % imageUrls.length);
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className={`relative w-full h-[100dvh] sm:h-auto sm:max-h-[90vh] sm:max-w-6xl overflow-hidden bg-white sm:rounded-3xl shadow-2xl flex flex-col md:flex-row ${
              needsLightText
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-800"
            }`}
            style={
              needsLightText && secondary ? { backgroundColor: secondary } : {}
            }
            onClick={(e) => e.stopPropagation()}
          >
            {/* Share Button (Top Right) */}
            {showShareButton && (
              <button
                onClick={() => shareProduct(product)}
                className="absolute top-4 right-16 z-50 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-sm transition-colors"
                title="Compartir"
              >
                <Share2 size={24} />
              </button>
            )}

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-50 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-sm transition-colors"
            >
              <X size={24} />
            </button>

            {/* Left: Image Gallery (60% width on desktop) */}
            <div className="w-full md:w-[60%] h-[45dvh] sm:h-[50vh] md:h-auto md:min-h-[600px] relative bg-black/5 flex flex-col">
              <div className="flex-1 relative overflow-hidden flex items-center justify-center">
                {imageUrls.length > 0 ? (
                  <motion.img
                    key={currentIdx}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    src={imageUrls[currentIdx]}
                    alt={product.name}
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-400">
                    <Package size={64} strokeWidth={1} />
                    <span className="mt-2 text-sm">Sin imagen</span>
                  </div>
                )}

                {/* Navigation Arrows */}
                {imageUrls.length > 1 && (
                  <>
                    <button
                      onClick={prevImg}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white transition-colors"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <button
                      onClick={nextImg}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white transition-colors"
                    >
                      <ChevronRight size={24} />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails (Desktop bottom) */}
              {imageUrls.length > 1 && (
                <div className="h-20 bg-white/5 backdrop-blur-md border-t border-white/10 flex items-center gap-2 px-4 overflow-x-auto">
                  {imageUrls.map((url, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentIdx(idx)}
                      className={`h-14 w-14 rounded-lg overflow-hidden border-2 transition-all ${
                        idx === currentIdx
                          ? "border-white scale-105"
                          : "border-transparent opacity-50 hover:opacity-100"
                      }`}
                    >
                      <img src={url} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Product Details (40% width on desktop) */}
            <div className="w-full md:w-[40%] flex flex-col h-[55dvh] sm:h-[50vh] md:h-auto border-t md:border-t-0 md:border-l border-white/10">
              <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
                {/* Header */}
                <div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {product.categories?.map((cat) => (
                      <span
                        key={cat.id}
                        className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/10 border border-white/10 text-current opacity-80"
                      >
                        {cat.name}
                      </span>
                    ))}
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold leading-tight mb-2">
                    {product.name}
                  </h2>
                  <div className="text-xl md:text-2xl font-light opacity-90">
                    {formatPrice(product.price, product.currency)}
                  </div>
                </div>

                {/* Stock & Description */}
                <div className="space-y-4">
                  {typeof product.stock === "number" && (
                    <div className="flex items-center gap-2 text-sm font-medium opacity-70">
                      <Package size={16} />
                      <span>{product.stock} disponibles</span>
                    </div>
                  )}
                  {product.description && (
                    <p className="text-sm md:text-base leading-relaxed opacity-80 whitespace-pre-line">
                      {product.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Footer Actions */}
              <div className="p-6 md:p-8 border-t border-white/10 bg-black/5 space-y-4">
                {/* Quantity & Add to Cart */}
                <div className="flex gap-4">
                  {/* Quantity Selector */}
                  <div className="flex items-center bg-white/10 rounded-xl border border-white/10">
                    <button
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                      className="p-3 hover:bg-white/10 transition-colors"
                    >
                      <Minus size={18} />
                    </button>
                    <span className="w-12 text-center font-bold">{qty}</span>
                    <button
                      onClick={() => setQty((q) => q + 1)}
                      className="p-3 hover:bg-white/10 transition-colors"
                    >
                      <Plus size={18} />
                    </button>
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 py-3 px-6 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 text-white shadow-lg"
                    style={{ backgroundColor: primary || "#3b82f6" }}
                  >
                    {justAdded ? (
                      <>
                        <Check size={20} />
                        <span>Agregado</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart size={20} />
                        <span>Agregar</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Direct Purchase Link (if available) */}
                {store?.paymentLink && showPaymentButton && (
                  <a
                    href={store.paymentLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-full py-3 px-4 rounded-xl font-bold text-center text-sm flex items-center justify-center gap-2 transition-colors ${
                      needsLightText
                        ? "bg-white text-black hover:bg-white/90"
                        : "bg-slate-900 text-white hover:bg-slate-800"
                    }`}
                  >
                    <ExternalLink size={16} /> Comprar Directo
                  </a>
                )}

                {/* Custom WhatsApp Checkout */}
                {store?.whatsapp && (
                  <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
                    <button
                      onClick={() => {
                        const number = store.whatsapp.replace(/\D/g, "");
                        const text = encodeURIComponent(
                          `Hola! Me interesa comprar lo siguiente de ${store?.name || "la tienda"}:\n\n` +
                            `• ${qty}x ${product.name} ${formatPrice(product.price, product.currency)}\n\n` +
                            `Total: ${formatPrice(product.price * qty, product.currency)}`,
                        );
                        window.open(
                          `https://wa.me/${number}?text=${text}`,
                          "_blank",
                        );
                      }}
                      className="w-full bg-[#25D366] text-white py-3 px-4 rounded-xl flex items-center justify-center gap-2 hover:bg-[#20bd5a] transition-colors font-bold text-sm shadow-lg shadow-green-900/10"
                    >
                      <MessageCircle size={18} />
                      Pedir por WhatsApp
                    </button>
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
