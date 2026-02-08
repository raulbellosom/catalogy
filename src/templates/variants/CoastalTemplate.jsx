import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  Menu,
  ShoppingBag,
  X,
  Share2,
  Filter,
  RotateCcw,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Home,
  Pause,
  Play,
  Waves,
} from "lucide-react";
import { getStoreLogoUrl } from "@/shared/services/storeService";
import { getProductImageUrl } from "@/shared/services/productService";
import {
  ProductDetailModal,
  CatalogFilters,
  StorePurchaseInfo,
  StoreFooter,
  shareProduct,
  CartDrawer,
  WhatsAppFloatingButton,
} from "../components";
import { ImageViewerModal } from "@/shared/ui/molecules/ImageViewerModal";
import {
  useCatalogFilters,
  useShoppingCart,
  useProductDeepLink,
} from "../components/catalogHooks";
import { resolveThemeSettings } from "@/templates/registry";
import { resolveCatalogSettings } from "@/shared/utils/storeSettings";
import { Logo } from "@/shared/ui/atoms/Logo";

/**
 * CoastalTemplate ("Breezy")
 *
 * A refreshing, modern template inspired by ocean breezes and clear skies.
 * Features the 'Outfit' font, vibrant ocean blues, glassmorphism, and floating animations.
 */

const resolveFontFamily = (fontId) => {
  const map = {
    inter: "'Inter', sans-serif",
    outfit: "'Outfit', sans-serif",
    merriweather: "'Merriweather', serif",
    jetbrains: "'JetBrains Mono', monospace",
    roboto: "'Roboto', sans-serif",
    playfair: "'Playfair Display', serif",
    montserrat: "'Montserrat', sans-serif",
    poppins: "'Poppins', sans-serif",
  };
  return map[fontId] || "'Outfit', sans-serif";
};

const formatPrice = (price, currency = "MXN") => {
  if (typeof price !== "number") return "";
  return price.toLocaleString("es-MX", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

// Coastal Button Component
const CoastalButton = ({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center gap-2 font-semibold rounded-full transition-all duration-300 active:scale-95";

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-base",
  };

  const variants = {
    primary:
      "bg-(--coastal-primary) text-white shadow-lg shadow-(--coastal-primary)/30 hover:shadow-xl hover:shadow-(--coastal-primary)/40 hover:-translate-y-0.5",
    secondary:
      "bg-white text-slate-800 border border-white/50 shadow-sm hover:shadow-md hover:bg-white/80 hover:-translate-y-0.5 backdrop-blur-md",
    ghost:
      "bg-transparent text-slate-600 hover:bg-white/50 hover:text-slate-900",
    outline:
      "bg-transparent text-(--coastal-primary) border-2 border-(--coastal-primary) hover:bg-(--coastal-primary) hover:text-white",
  };

  return (
    <button
      className={`${baseStyles} ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

// Category Pill Component - Kept for mobile or small screens if needed,
// though we use grid in main filters now.
const CategoryPill = ({ children, active = false, icon: Icon, onClick }) => (
  <button
    onClick={onClick}
    className={`
      inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium
      transition-all duration-300 whitespace-nowrap backdrop-blur-md
      ${
        active
          ? "bg-(--coastal-primary) text-white shadow-lg shadow-(--coastal-primary)/30"
          : "bg-white/60 text-slate-700 border border-white/50 hover:bg-white hover:text-(--coastal-primary) hover:shadow-md"
      }
    `}
  >
    {Icon && <Icon className="w-4 h-4" />}
    {children}
  </button>
);

// Carousel Card Component
const ProductCard = ({ product, primaryColor, onClick, isFeatured }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const images = product.imageFileIds || [];
  const hasMultipleImages = images.length > 1;

  // Auto-cycle images on hover
  useEffect(() => {
    let interval;
    if (isHovered && hasMultipleImages) {
      interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
      }, 1500);
    } else {
      setCurrentImageIndex(0);
    }
    return () => clearInterval(interval);
  }, [isHovered, hasMultipleImages, images.length]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative bg-white rounded-2xl overflow-hidden shadow-md shadow-slate-200/50 hover:shadow-xl hover:shadow-(--coastal-primary)/10 transition-all duration-300 cursor-pointer h-full flex flex-col border border-slate-100"
    >
      {/* Image Area - Aspect 3/4 for better fit */}
      <div className="aspect-[3/4] overflow-hidden relative bg-slate-50">
        {images.length > 0 ? (
          <AnimatePresence mode="wait">
            <motion.img
              key={images[currentImageIndex]}
              src={getProductImageUrl(images[currentImageIndex])}
              alt={product.name}
              initial={{ opacity: 0.8 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0.8 }}
              transition={{ duration: 0.3 }}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </AnimatePresence>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 bg-slate-50 p-4">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-2">
              <Waves className="w-8 h-8 text-slate-300" />
            </div>
            <span className="text-xs font-medium uppercase tracking-widest text-slate-300">
              Sin Imagen
            </span>
          </div>
        )}

        {/* Overlay Gradient */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-slate-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Quick Action Button - Always visible on mobile, hover on desktop */}
        <button className="absolute bottom-3 right-3 bg-white text-(--coastal-primary)! p-2.5 rounded-full shadow-lg md:translate-y-10 md:opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-10 hover:scale-110">
          <ExternalLink className="w-4 h-4" />
        </button>

        {/* Carousel Indicators */}
        {hasMultipleImages && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1 z-10 pointer-events-none">
            {images.map((_, idx) => (
              <div
                key={idx}
                className={`h-1 rounded-full transition-all duration-300 shadow-sm ${idx === currentImageIndex ? "w-4 bg-white" : "w-1 bg-white/60"}`}
              />
            ))}
          </div>
        )}
        {/* Featured Badge */}
        {isFeatured && (
          <div className="absolute top-3 left-3 z-10">
            <span className="bg-yellow-400 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Destacado
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col">
        {/* Categories / Tags */}
        {product.categories && product.categories.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {product.categories.slice(0, 2).map((cat, idx) => (
              <span
                key={idx}
                className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full"
              >
                {cat.name}
              </span>
            ))}
          </div>
        )}

        <div className="mb-1">
          <h3 className="font-bold text-slate-800! text-base leading-tight group-hover:text-(--coastal-primary)! transition-colors line-clamp-2">
            {product.name}
          </h3>
        </div>

        <div className="mt-auto pt-3 flex items-center justify-between">
          <span className="font-bold text-(--coastal-primary)! text-lg">
            {formatPrice(product.price)}
          </span>
          {/* Mobile "Add" text or icon could go here if needed, but the button above covers it */}
        </div>
      </div>
    </motion.div>
  );
};

export function CoastalTemplate({ store, products, isPreview = false }) {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false); // Default closed as requested

  // Hero Carousel State
  const [heroIndex, setHeroIndex] = useState(0);
  const [isCarouselPaused, setIsCarouselPaused] = useState(false);

  // Settings Resolution
  const theme = resolveThemeSettings(store);
  const catalog = resolveCatalogSettings(store);
  // Default to Outfit if font is 'inter' or undefined/null from legacy settings
  const fontFamily = resolveFontFamily(
    theme.font === "inter" ? "outfit" : theme.font,
  );
  const primary = theme.colors.primary;

  const logoUrl = store?.logoFileId ? getStoreLogoUrl(store.logoFileId) : null;

  const {
    categories,
    searchQuery,
    setSearchQuery,
    activeCategoryIds,
    toggleCategory,
    minPrice,
    setMinPrice,
    maxPrice,
    setMaxPrice,
    priceBounds,
    filteredProducts,
    sortOrder,
    setSortOrder,
    resetFilters,
    showFeaturedOnly,
    toggleFeaturedOnly,
    hasFeaturedProducts,
  } = useCatalogFilters({ store, products });

  // Cart Logic
  const {
    cart,
    addToCart,
    removeFromCart,
    updateQty,
    getCartShareUrl,
    handleWhatsAppCheckout,
    isCartOpen,
    setIsCartOpen,
  } = useShoppingCart(store.id || store.$id, products);

  // Deep Linking
  const initialProduct = useProductDeepLink(products);

  useEffect(() => {
    if (initialProduct && products) {
      const found = products.find((p) => (p.id || p.$id) === initialProduct);
      if (found) setSelectedProduct(found);
    }
  }, [initialProduct, products]);

  // Featured Products Logic
  const featuredProductIds = catalog.featuredProductIds || [];

  const heroProducts = useMemo(() => {
    if (!products) return [];

    // 1. Try to find products that match the manual featured IDs
    let featured = [];
    if (featuredProductIds.length > 0) {
      featured = products.filter((p) =>
        featuredProductIds.includes(p.id || p.$id),
      );
    }

    // 2. If no manual featured products (or not enough), fall back to defaults (first 5)
    if (featured.length === 0) {
      return products
        .slice() // Copy before sort
        .sort((a, b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999))
        .slice(0, 5);
    }

    return featured;
  }, [products, featuredProductIds]);

  // Auto-advance carousel
  useEffect(() => {
    if (heroProducts.length <= 1 || isCarouselPaused) return;

    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroProducts.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [heroProducts.length, isCarouselPaused]);

  // ImageViewer
  const [viewer, setViewer] = useState({
    isOpen: false,
    images: [],
    index: 0,
  });

  const openViewer = (index, images) => {
    setViewer({ isOpen: true, images, index });
  };

  return (
    <div
      className="min-h-screen flex flex-col pt-[calc(var(--store-navbar-height)+var(--store-navbar-offset)+env(safe-area-inset-top))] bg-(--coastal-bg) !text-slate-800"
      style={{
        fontFamily,
        colorScheme: "light", // Forces light mode for browser UI
        "--coastal-primary": primary,
        "--coastal-bg": "#f0f9ff", // Sky 50 base
        "--store-navbar-height": "4.5rem",
        "--store-navbar-offset": isPreview ? "2.5rem" : "0rem",
      }}
    >
      <style>{`
        .coastal-gradient {
          background: linear-gradient(180deg, #e0f2fe 0%, #f0f9ff 50%, #fff 100%);
        }
        .glass-panel {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.5);
        }
        .float-animation {
          animation: float 6s ease-in-out infinite;
        }
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        /* Force light mode text colors to override any global dark mode leaks */
        .text-slate-800 { color: #1e293b !important; }
        .text-slate-600 { color: #475569 !important; }
        .text-slate-500 { color: #64748b !important; }
        .text-slate-400 { color: #94a3b8 !important; }
        .bg-white { background-color: #ffffff !important; }
      `}</style>

      {/* Background Gradient */}
      <div className="fixed inset-0 coastal-gradient -z-10" />

      {/* ========== NAVBAR ========== */}
      <nav
        className={`fixed ${isPreview ? "top-10" : "top-0"} left-0 right-0 z-50 glass-panel border-b-0 shadow-sm transition-all duration-300`}
        style={{ height: "var(--store-navbar-height)" }}
      >
        <div className="mx-auto max-w-7xl px-4 h-full flex items-center justify-between gap-4">
          {/* Logo & Name */}
          <div className="flex items-center gap-3 shrink-0">
            {logoUrl ? (
              <div className="w-10 h-10 rounded-xl overflow-hidden shadow-md">
                <img
                  src={logoUrl}
                  alt={store?.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-xl bg-(--coastal-primary)/10 flex items-center justify-center text-(--coastal-primary)">
                <Waves className="w-6 h-6" />
              </div>
            )}
            <span className="font-bold text-xl tracking-tight !text-slate-800 truncate max-w-[150px] md:max-w-none">
              {store?.name || "Store"}
            </span>
          </div>

          {/* Desktop Search */}
          {catalog.showSearch && (
            <div className="flex-1 max-w-lg mx-4 hidden md:block">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 !text-slate-400 group-focus-within:text-(--coastal-primary) transition-colors" />
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-2.5 bg-white/50 border border-white/60 rounded-full text-base !text-slate-800 placeholder:!text-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-(--coastal-primary)/20 focus:border-(--coastal-primary) transition-all shadow-sm"
                />
              </div>
            </div>
          )}

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            {store?.paymentLink && catalog.showPaymentButton && (
              <CoastalButton
                variant="primary"
                size="md"
                onClick={() => window.open(store.paymentLink, "_blank")}
                className="shadow-(--coastal-primary)/20"
              >
                <ExternalLink className="w-4 h-4" />
                Ir a pagar
              </CoastalButton>
            )}

            {catalog.showCart && (
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 text-slate-800 hover:text-(--coastal-primary) transition-colors"
                title="Ver carrito"
              >
                <ShoppingBag className="w-6 h-6" />
                {cart.length > 0 && (
                  <span className="absolute top-0 right-0 bg-(--coastal-primary) text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">
                    {cart.length}
                  </span>
                )}
              </button>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 !text-slate-600 hover:text-(--coastal-primary) rounded-xl hover:bg-white/50 transition-colors"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </nav>

      {heroProducts.length > 0 && (
        <section className="h-[calc(100vh-var(--store-navbar-height))] min-h-[600px] relative overflow-hidden mb-0">
          <AnimatePresence mode="wait">
            {/* Background Layer (Blurred) */}
            <motion.div
              key={heroIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="absolute inset-0"
            >
              {heroProducts[heroIndex]?.imageFileIds?.[0] ? (
                <img
                  src={getProductImageUrl(
                    heroProducts[heroIndex].imageFileIds[0],
                  )}
                  className="w-full h-full object-cover"
                  alt={heroProducts[heroIndex].name}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-800">
                  <Waves className="w-32 h-32 text-white/5" />
                </div>
              )}
              {/* Gradient Overlay for Text Readability (Left to Right) */}
              <div className="absolute inset-0 bg-linear-to-r from-slate-900/90 via-slate-900/40 to-transparent" />
            </motion.div>
          </AnimatePresence>

          {/* Foreground Hero Content (Left Aligned) */}
          <div className="absolute inset-0 z-10 flex items-center justify-start px-6 md:px-16 container mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={`content-${heroIndex}`}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 30 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="max-w-xl text-left space-y-6"
              >
                {heroProducts[heroIndex]?.categories?.[0] && (
                  <span className="inline-block text-(--coastal-primary) bg-white/10 backdrop-blur-md border border-white/20 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                    {heroProducts[heroIndex].categories[0].name}
                  </span>
                )}

                <h2 className="text-4xl md:text-6xl font-bold text-white leading-tight drop-shadow-lg">
                  {heroProducts[heroIndex]?.name}
                </h2>

                <div className="text-3xl md:text-4xl font-bold text-(--coastal-primary)! drop-shadow-md">
                  {formatPrice(heroProducts[heroIndex]?.price)}
                </div>

                <p className="text-slate-200 text-lg line-clamp-3 md:line-clamp-4 max-w-lg drop-shadow-sm">
                  {heroProducts[heroIndex]?.description}
                </p>

                <div className="flex flex-wrap gap-4 pt-4">
                  <CoastalButton
                    variant="primary"
                    size="lg"
                    onClick={() => setSelectedProduct(heroProducts[heroIndex])}
                    className="min-w-[160px]"
                  >
                    Ver Detalles
                  </CoastalButton>
                  <CoastalButton
                    variant="secondary"
                    size="lg"
                    onClick={(e) => {
                      e.stopPropagation();
                      shareProduct(heroProducts[heroIndex], store);
                    }}
                    className="bg-white/10 text-white border-white/30 hover:bg-white hover:border-white hover:text-slate-900"
                  >
                    <Share2 className="w-4 h-4" /> Compartir
                  </CoastalButton>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Controls */}
          {heroProducts.length > 1 && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-4 bg-black/30 backdrop-blur-md px-6 py-3 rounded-full border border-white/20 shadow-lg hover:bg-black/40 transition-colors">
              {/* Prev Button */}
              <button
                onClick={() =>
                  setHeroIndex(
                    (prev) =>
                      (prev - 1 + heroProducts.length) % heroProducts.length,
                  )
                }
                className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* Pause/Play */}
              <button
                onClick={() => setIsCarouselPaused(!isCarouselPaused)}
                className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors"
              >
                {isCarouselPaused ? (
                  <Play className="w-4 h-4" />
                ) : (
                  <Pause className="w-4 h-4" />
                )}
              </button>

              {/* Dots */}
              <div className="flex gap-2 mx-2">
                {heroProducts.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setHeroIndex(idx)}
                    className={`rounded-full transition-all duration-300 ${
                      idx === heroIndex
                        ? "bg-(--coastal-primary) w-8 h-2.5"
                        : "bg-white/50 hover:bg-white/80 w-2.5 h-2.5"
                    }`}
                  />
                ))}
              </div>

              {/* Next Button */}
              <button
                onClick={() =>
                  setHeroIndex((prev) => (prev + 1) % heroProducts.length)
                }
                className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </section>
      )}

      {/* ========== SEARCH & FILTERS SECTION ========== */}
      {(catalog.showSearch || catalog.showFilters) && (
        <section className="px-4 py-8 relative z-10 -mt-16">
          <div className="max-w-7xl mx-auto">
            <div className="glass-panel rounded-3xl p-6 md:p-8 shadow-xl shadow-slate-200/50">
              {/* Search Header */}
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold !text-slate-800">
                    Explora la Colección
                  </h2>
                  <p className="!text-slate-500 text-sm">
                    Encuentra lo que buscas con estilo
                  </p>
                </div>
                {/* Desktop Controls */}
                <div className="flex gap-3">
                  {catalog.showFilters && (
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className={`hidden md:flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-colors ${showFilters ? "bg-(--coastal-primary)/10 text-(--coastal-primary)" : "bg-slate-100 !text-slate-600 hover:bg-slate-200"}`}
                    >
                      <Filter className="w-4 h-4" />
                      {showFilters ? "Ocultar Filtros" : "Mostrar Filtros"}
                    </button>
                  )}
                  {/* Mobile Filter Button (opens Sidebar) */}
                  {catalog.showFilters && (
                    <button
                      onClick={() => setMobileMenuOpen(true)}
                      className="md:hidden flex items-center gap-2 px-4 py-2 rounded-full font-medium bg-slate-100 !text-slate-600 hover:bg-slate-200"
                    >
                      <Filter className="w-4 h-4" /> Filtros
                    </button>
                  )}

                  {catalog.showSort && (
                    <select
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value)}
                      className="px-4 py-2 bg-slate-100 rounded-full text-sm font-medium !text-slate-600 focus:outline-none cursor-pointer hover:bg-slate-200"
                    >
                      <option value="none">Relevancia</option>
                      <option value="asc">Menor precio</option>
                      <option value="desc">Mayor precio</option>
                    </select>
                  )}
                </div>
              </div>

              {/* Filters Collapse (Desktop Only) */}
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden mb-6 hidden md:block"
                  >
                    <CatalogFilters
                      categories={categories}
                      activeCategoryIds={activeCategoryIds}
                      onToggleCategory={toggleCategory}
                      minPrice={minPrice}
                      maxPrice={maxPrice}
                      onMinPriceChange={setMinPrice}
                      onMaxPriceChange={setMaxPrice}
                      priceBounds={priceBounds}
                      sortOrder={sortOrder}
                      mainColor={primary}
                      layout="grid" // Use grid layout for categories
                      showFeaturedOnly={showFeaturedOnly}
                      onToggleFeaturedOnly={toggleFeaturedOnly}
                      hasFeaturedProducts={hasFeaturedProducts}
                    />
                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={resetFilters}
                        className="text-xs font-bold !text-slate-400 hover:!text-(--coastal-primary) uppercase tracking-wider flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" /> Limpiar Todo
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </section>
      )}

      {/* ========== PRODUCT GRID ========== */}
      <main className="flex-1 px-4 pb-20">
        <div className="max-w-7xl mx-auto">
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
              {filteredProducts.map((product, index) => (
                <ProductCard
                  key={product.id || product.$id}
                  product={product}
                  primaryColor={primary}
                  onClick={() => setSelectedProduct(product)}
                  isFeatured={product.isFeatured}
                  whatsappNumber={store.whatsapp}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white/50 rounded-3xl border border-white/50">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 !text-slate-400">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold !text-slate-700 mb-2">
                No se encontraron productos
              </h3>
              <p className="!text-slate-500 mb-6">
                Intenta con otros filtros o términos de búsqueda.
              </p>
              <CoastalButton onClick={resetFilters} variant="outline">
                Limpiar Filtros
              </CoastalButton>
            </div>
          )}
        </div>
      </main>

      {/* ========== FOOTER ========== */}
      <StoreFooter
        store={store}
        config={{
          bg: "bg-white",
          text: "text-slate-600",
          border: "border-slate-100",
          muted: "text-slate-400",
        }}
      />

      <ImageViewerModal
        isOpen={viewer.isOpen}
        onClose={() => setViewer((v) => ({ ...v, isOpen: false }))}
        images={viewer.images}
        initialIndex={viewer.index}
      />

      <ProductDetailModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        store={store}
        showShareButton={catalog.showShareButton}
        showPaymentButton={catalog.showPaymentButton}
        onAddToCart={addToCart}
      />

      {catalog.showCart && (
        <CartDrawer
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          cart={cart}
          onRemove={removeFromCart}
          onUpdateQty={updateQty}
          onShareCart={() => {
            const url = getCartShareUrl();
            if (navigator.share) {
              navigator.share({
                title: `Mi Carrito en ${store.name}`,
                url: url,
              });
            } else {
              navigator.clipboard.writeText(url);
              alert("Link copiado al portapapeles");
            }
          }}
          onWhatsAppCheckout={handleWhatsAppCheckout}
          storeName={store.name}
          whatsappNumber={store.whatsapp}
        />
      )}

      {/* Mobile Sidebar (Filters & Menu) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm md:hidden"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 right-0 z-[60] w-80 bg-white p-6 md:hidden shadow-2xl flex flex-col h-full overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-8 shrink-0">
                <span className="font-bold text-lg !text-slate-800">
                  Menú & Filtros
                </span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 bg-slate-50 rounded-full !text-slate-500 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-8 flex-1">
                {/* Mobile Search */}
                {catalog.showSearch && (
                  <div>
                    <label className="text-xs font-bold !text-slate-400 uppercase tracking-wider mb-2 block">
                      Buscar
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 !text-slate-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-(--coastal-primary)/20 !text-slate-800"
                        placeholder="Buscar..."
                      />
                    </div>
                  </div>
                )}

                {/* Mobile Filters */}
                {catalog.showFilters && (
                  <div className="border-t border-slate-100 pt-6">
                    <CatalogFilters
                      categories={categories}
                      activeCategoryIds={activeCategoryIds}
                      onToggleCategory={(id) => {
                        toggleCategory(id);
                        // Optional: don't close menu on toggle to allow multiple selections
                      }}
                      minPrice={minPrice}
                      maxPrice={maxPrice}
                      onMinPriceChange={setMinPrice}
                      onMaxPriceChange={setMaxPrice}
                      priceBounds={priceBounds}
                      sortOrder={sortOrder}
                      mainColor={primary}
                      layout="list" // Use list layout for mobile sidebar
                      showFeaturedOnly={showFeaturedOnly}
                      onToggleFeaturedOnly={toggleFeaturedOnly}
                      hasFeaturedProducts={hasFeaturedProducts}
                    />
                    <button
                      onClick={resetFilters}
                      className="mt-4 w-full py-2 text-xs font-bold !text-slate-400 hover:!text-(--coastal-primary) border border-slate-200 rounded-lg hover:border-(--coastal-primary) transition-colors"
                    >
                      Limpiar Filtros
                    </button>
                  </div>
                )}

                {store?.paymentLink && catalog.showPaymentButton && (
                  <div className="mt-auto pt-6 border-t border-slate-100">
                    <a
                      href={store.paymentLink}
                      target="_blank"
                      className="flex w-full items-center justify-center gap-2 bg-(--coastal-primary) text-white py-4 rounded-xl font-bold shadow-lg shadow-(--coastal-primary)/30"
                    >
                      <ExternalLink className="w-5 h-5" />
                      Ir a Pagar
                    </a>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      <WhatsAppFloatingButton phoneNumber={store.whatsapp} />
    </div>
  );
}
