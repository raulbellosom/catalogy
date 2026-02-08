import { useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Image as ImageIcon,
  MessageCircle,
  Package,
  Search,
  Share2,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";
import { ImageCarousel } from "@/shared/ui/molecules/ImageCarousel";
import { getProductImageUrl } from "@/shared/services/productService";

const TONE_STYLES = {
  light: {
    panel: "bg-(--card) border-(--border) text-(--foreground)",
    card: "bg-(--card) border-(--border) text-(--foreground)",
    cardHover: "hover:border-(--primary) hover:shadow-lg",
    input:
      "bg-(--background) border-(--border) text-(--foreground) placeholder:text-(--muted-foreground)",
    chip:
      "border-(--border) bg-(--background) text-(--foreground) hover:border-(--primary)",
    chipActive: "border-(--primary) bg-(--primary) text-white",
    muted: "text-(--muted-foreground)",
    accent: "text-(--primary)",
    tag: "bg-(--muted) text-(--foreground)",
    footer: "bg-(--muted)",
    overlay: "bg-black/70",
  },
  noir: {
    panel: "bg-slate-900 border-slate-700 text-slate-100",
    card: "bg-slate-900 border-slate-700 text-slate-100",
    cardHover: "hover:border-slate-500 hover:shadow-xl hover:shadow-black/20",
    input:
      "bg-slate-950 border-slate-700 text-slate-100 placeholder:text-slate-400",
    chip:
      "border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-400",
    chipActive: "border-slate-100 bg-slate-100 text-slate-950",
    muted: "text-slate-400",
    accent: "text-slate-100",
    tag: "bg-slate-800 text-slate-200",
    footer: "bg-slate-950",
    overlay: "bg-black/80",
  },
};

const formatPrice = (price, currency = "MXN") => {
  const numeric = Number(price);
  if (!Number.isFinite(numeric)) return "";
  return numeric.toLocaleString("es-MX", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const formatCompactPrice = (price) =>
  new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(Number(price)) ? Number(price) : 0);

const getTone = (tone) => TONE_STYLES[tone] || TONE_STYLES.light;

const getProductImages = (product) => {
  const imageIds = Array.isArray(product?.imageFileIds) ? product.imageFileIds : [];
  const urls = imageIds.map(getProductImageUrl).filter(Boolean);
  if (urls.length > 0) return urls;

  const legacyUrl = product?.imageFileId ? getProductImageUrl(product.imageFileId) : null;
  return legacyUrl ? [legacyUrl] : [];
};

const buildWhatsAppLink = (rawNumber, message) => {
  const safeNumber = String(rawNumber || "").replace(/\D/g, "");
  if (!safeNumber) return null;
  return `https://wa.me/${safeNumber}?text=${encodeURIComponent(message)}`;
};

export function PuckCatalogControls({
  tone = "light",
  searchQuery,
  onSearchChange,
  minPrice,
  maxPrice,
  onMinPriceChange,
  onMaxPriceChange,
  priceBounds,
  categories,
  activeCategoryIds,
  onToggleCategory,
  sortOrder,
  setSortOrder,
  onReset,
  showSearch = true,
  showFilters = true,
  showSort = true,
  showPrice = true,
  showCategories = true,
  orientation = "horizontal",
  showFeaturedOnly = false,
  onToggleFeaturedOnly,
  hasFeaturedProducts = false,
}) {
  const styles = getTone(tone);
  const isVertical = orientation === "vertical";
  const showHeader = showSearch || showFilters;
  const showRange = showFilters && showPrice;
  const showCategoryChips = showFilters && showCategories && categories?.length > 0;

  return (
    <div className={`rounded-2xl p-6 space-y-5 border ${styles.panel}`}>
      {showHeader && (
        <div className="flex items-center justify-between gap-3 text-xs uppercase tracking-[0.2em]">
          <div className={`flex items-center gap-2 ${styles.muted}`}>
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>Filtros</span>
          </div>
          {onReset && (
            <button
              type="button"
              onClick={onReset}
              className={`text-[10px] font-bold uppercase tracking-[0.2em] hover:opacity-80 ${styles.muted}`}
            >
              Reiniciar
            </button>
          )}
        </div>
      )}

      {(showSearch || showSort) && (
        <div className={`flex flex-col ${isVertical ? "gap-5" : "lg:flex-row gap-5"}`}>
          <div className={`flex-1 flex ${isVertical ? "flex-col gap-3" : "gap-3"}`}>
            {showSearch && (
              <div className="relative flex-1">
                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${styles.muted}`} />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => onSearchChange(event.target.value)}
                  placeholder="Buscar..."
                  className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none border ${styles.input}`}
                />
              </div>
            )}
            {showSort && (
              <select
                value={sortOrder}
                onChange={(event) => setSortOrder?.(event.target.value)}
                className={`px-4 py-3 rounded-xl text-sm outline-none min-w-[150px] cursor-pointer border ${styles.input}`}
              >
                <option value="none">Relevancia</option>
                <option value="asc">Menor precio</option>
                <option value="desc">Mayor precio</option>
              </select>
            )}
          </div>

          {showRange && (
            <div className={`flex flex-col ${isVertical ? "gap-4" : "sm:flex-row gap-4 min-w-[280px]"}`}>
              <div className="flex-1 space-y-2">
                <div className={`flex justify-between items-center text-[10px] uppercase tracking-widest ${styles.muted}`}>
                  <span>Precio Min</span>
                  <span className={styles.accent}>{formatCompactPrice(minPrice)}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={priceBounds?.max || 0}
                  step="1"
                  value={minPrice}
                  onChange={(event) => onMinPriceChange(Number(event.target.value))}
                  className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-(--primary)"
                />
              </div>
              <div className="flex-1 space-y-2">
                <div className={`flex justify-between items-center text-[10px] uppercase tracking-widest ${styles.muted}`}>
                  <span>Precio Max</span>
                  <span className={styles.accent}>{formatCompactPrice(maxPrice)}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={priceBounds?.max || 0}
                  step="1"
                  value={maxPrice}
                  onChange={(event) => onMaxPriceChange(Number(event.target.value))}
                  className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-(--primary)"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {(showFeaturedOnly || hasFeaturedProducts) && onToggleFeaturedOnly && (
        <button
          type="button"
          onClick={onToggleFeaturedOnly}
          className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold border transition-colors ${
            showFeaturedOnly ? styles.chipActive : styles.chip
          }`}
        >
          <Sparkles className="h-3.5 w-3.5" />
          Solo destacados
        </button>
      )}

      {showCategoryChips && (
        <div className="flex flex-wrap gap-2 pt-2 border-t border-(--border)">
          {categories.map((category) => {
            const active = activeCategoryIds.includes(category.id);
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => onToggleCategory(category.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                  active ? styles.chipActive : styles.chip
                }`}
              >
                {category.name}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function PuckProductCard({
  product,
  tone = "light",
  showDescription = true,
  showShareButton = true,
  showCategories = true,
  showWhatsAppButton = true,
  whatsappNumber,
  onClick,
  onCategoryClick,
  onShare,
}) {
  const styles = getTone(tone);
  const images = useMemo(() => getProductImages(product), [product]);

  const handleShare = async (event) => {
    event.stopPropagation();
    await onShare?.(product);
  };

  const whatsappLink =
    showWhatsAppButton && whatsappNumber
      ? buildWhatsAppLink(
          whatsappNumber,
          `Hola, me interesa este producto: ${product?.name || ""}`,
        )
      : null;

  return (
    <article
      className={`rounded-2xl border overflow-hidden transition-all cursor-pointer ${styles.card} ${styles.cardHover}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick?.();
        }
      }}
    >
      <div className="relative aspect-[4/5] bg-(--muted)">
        {showShareButton && (
          <button
            type="button"
            onClick={handleShare}
            className="absolute right-2 top-2 z-10 h-8 w-8 rounded-full border border-(--border) bg-(--card)/80 backdrop-blur-sm flex items-center justify-center text-(--muted-foreground) hover:text-(--primary)"
            aria-label="Compartir producto"
          >
            <Share2 className="h-4 w-4" />
          </button>
        )}
        <ImageCarousel images={images} alt={product?.name || "Producto"} className="h-full w-full" />
      </div>

      <div className="p-4 space-y-3">
        <div>
          <h3 className="text-base font-semibold leading-tight line-clamp-2">
            {product?.name}
          </h3>
          {showCategories && Array.isArray(product?.categories) && product.categories.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {product.categories.map((category) => (
                <button
                  key={category.id || category.name}
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    if (category.id) onCategoryClick?.(category.id);
                  }}
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold border ${styles.tag}`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {showDescription && product?.description && (
          <p className={`text-sm line-clamp-2 ${styles.muted}`}>{product.description}</p>
        )}

        <div className="flex items-end justify-between gap-2">
          <div className="flex flex-col">
            <span className={`text-[10px] uppercase tracking-wide ${styles.muted}`}>
              {product?.currency || "MXN"}
            </span>
            <span className="text-xl font-black">{formatPrice(product?.price, product?.currency)}</span>
          </div>
          <div className="flex items-center gap-2">
            {typeof product?.stock === "number" && (
              <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${styles.tag}`}>
                Stock: {product.stock}
              </span>
            )}
            {whatsappLink && (
              <a
                href={whatsappLink}
                target="_blank"
                rel="noreferrer"
                onClick={(event) => event.stopPropagation()}
                className="h-8 w-8 rounded-full bg-[#25D366] text-white flex items-center justify-center"
                aria-label="WhatsApp"
              >
                <MessageCircle className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

export function PuckProductDetailModal({
  product,
  isOpen,
  onClose,
  onShare,
  store,
  tone = "light",
  showShareButton = true,
  showPaymentButton = true,
}) {
  const styles = getTone(tone);
  const images = useMemo(() => getProductImages(product), [product]);
  const [imageIndex, setImageIndex] = useState(0);

  useEffect(() => {
    setImageIndex(0);
  }, [product?.$id, product?.id, isOpen]);

  useEffect(() => {
    if (!isOpen || typeof document === "undefined") return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  if (!isOpen || !product) return null;

  const hasMultipleImages = images.length > 1;
  const paymentLink = showPaymentButton ? store?.paymentLink?.trim() : "";
  const whatsappLink = store?.whatsapp
    ? buildWhatsAppLink(
        store.whatsapp,
        `Hola, quiero pedir ${product.name} por ${formatPrice(product.price, product.currency)}.`,
      )
    : null;

  return (
    <div className={`fixed inset-0 z-[120] flex items-center justify-center p-4 ${styles.overlay}`}>
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
        aria-label="Cerrar modal"
      />

      <section className={`relative z-10 w-full max-w-5xl rounded-3xl border overflow-hidden ${styles.panel}`}>
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-20 h-9 w-9 rounded-full border border-(--border) bg-(--card)/80 flex items-center justify-center"
          aria-label="Cerrar"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-[1.1fr_1fr]">
          <div className="relative min-h-[320px] bg-(--muted)">
            {images.length > 0 ? (
              <img
                src={images[imageIndex]}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full min-h-[320px] flex items-center justify-center">
                <ImageIcon className="h-16 w-16 text-(--muted-foreground)" />
              </div>
            )}

            {hasMultipleImages && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    setImageIndex((previous) =>
                      previous === 0 ? images.length - 1 : previous - 1,
                    )
                  }
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-black/45 text-white flex items-center justify-center"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setImageIndex((previous) =>
                      previous === images.length - 1 ? 0 : previous + 1,
                    )
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-black/45 text-white flex items-center justify-center"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}
          </div>

          <div className="p-5 md:p-7 space-y-5">
            <div className="space-y-2">
              <h3 className="text-2xl font-black leading-tight">{product.name}</h3>
              <p className={`text-sm ${styles.muted}`}>
                {formatPrice(product.price, product.currency)}
              </p>
              {typeof product.stock === "number" && (
                <p className={`text-sm ${styles.muted}`}>Stock disponible: {product.stock}</p>
              )}
            </div>

            {Array.isArray(product.categories) && product.categories.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {product.categories.map((category) => (
                  <span
                    key={category.id || category.name}
                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold border ${styles.tag}`}
                  >
                    {category.name}
                  </span>
                ))}
              </div>
            )}

            {product.description ? (
              <p className={`text-sm leading-relaxed whitespace-pre-line ${styles.muted}`}>
                {product.description}
              </p>
            ) : (
              <p className={`text-sm ${styles.muted}`}>Este producto no tiene descripcion.</p>
            )}

            <div className={`pt-4 border-t border-(--border) flex flex-wrap gap-2`}>
              {showShareButton && (
                <button
                  type="button"
                  onClick={() => onShare?.(product)}
                  className="inline-flex items-center gap-2 rounded-lg px-4 py-2 border border-(--border) text-sm font-semibold hover:bg-(--muted)"
                >
                  <Share2 className="h-4 w-4" />
                  Compartir
                </button>
              )}
              {paymentLink && (
                <a
                  href={paymentLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg px-4 py-2 bg-(--primary) text-white text-sm font-semibold"
                >
                  <ExternalLink className="h-4 w-4" />
                  Pagar
                </a>
              )}
              {whatsappLink && (
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg px-4 py-2 bg-[#25D366] text-white text-sm font-semibold"
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </a>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export function PuckEmptyProducts({ tone = "light", onReset }) {
  const styles = getTone(tone);

  return (
    <div className={`rounded-2xl border p-10 text-center ${styles.panel}`}>
      <Package className={`h-12 w-12 mx-auto ${styles.muted}`} />
      <p className="mt-3 text-sm font-semibold">No hay productos para mostrar</p>
      {onReset && (
        <button
          type="button"
          className={`mt-4 text-xs font-semibold ${styles.accent}`}
          onClick={onReset}
        >
          Reiniciar filtros
        </button>
      )}
    </div>
  );
}
