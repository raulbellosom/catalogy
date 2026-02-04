import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  Menu,
  X,
  Share2,
  Filter,
  RotateCcw,
  Package,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Home,
  Pause,
  Play,
} from "lucide-react";
import { getStoreLogoUrl } from "@/shared/services/storeService";
import { getProductImageUrl } from "@/shared/services/productService";
import {
  ProductDetailModal,
  CatalogFilters,
  StorePurchaseInfo,
  shareProduct,
} from "../components";
import { ImageViewerModal } from "@/shared/ui/molecules/ImageViewerModal";
import { useCatalogFilters } from "../components/catalogHooks";
import { resolveThemeSettings } from "@/templates/registry";
import { Logo } from "@/shared/ui/atoms/Logo";
import { appConfig } from "@/shared/lib/env";

/**
 * CoastalTemplate
 *
 * A tropical-modern template inspired by vacation rental platforms.
 * Features soft gradients, rounded cards, teal accents, and a sophisticated vibe.
 */

const resolveFontFamily = (fontId) => {
  const map = {
    inter: "'Inter', sans-serif",
    merriweather: "'Merriweather', serif",
    jetbrains: "'JetBrains Mono', monospace",
    roboto: "'Roboto', sans-serif",
    playfair: "'Playfair Display', serif",
    montserrat: "'Montserrat', sans-serif",
    poppins: "'Poppins', sans-serif",
  };
  return map[fontId] || "'Poppins', sans-serif";
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
      "bg-white text-gray-800 border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 hover:-translate-y-0.5",
    ghost: "bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900",
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

// Coastal Card Component
const CoastalCard = ({
  children,
  className = "",
  onClick,
  hover = true,
  featured = false,
}) => (
  <div
    onClick={onClick}
    className={`
      relative bg-white rounded-2xl overflow-hidden
      border border-gray-100
      ${hover ? "cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1" : ""}
      ${featured ? "ring-2 ring-(--coastal-primary) shadow-lg" : "shadow-md"}
      ${className}
    `}
  >
    {children}
  </div>
);

// Category Pill Component
const CategoryPill = ({ children, active = false, icon: Icon, onClick }) => (
  <button
    onClick={onClick}
    className={`
      inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium
      transition-all duration-300 whitespace-nowrap
      ${
        active
          ? "bg-(--coastal-primary) text-white shadow-lg shadow-(--coastal-primary)/30"
          : "bg-white text-gray-700 border border-gray-200 hover:border-(--coastal-primary) hover:text-(--coastal-primary)"
      }
    `}
  >
    {Icon && <Icon className="w-4 h-4" />}
    {children}
  </button>
);

export function CoastalTemplate({ store, products, isPreview = false }) {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Hero Carousel State
  const [heroIndex, setHeroIndex] = useState(0);
  const [isCarouselPaused, setIsCarouselPaused] = useState(false);

  // Settings Resolution
  const theme = resolveThemeSettings(store);
  const fontFamily = resolveFontFamily(theme.font);
  const primary = theme.colors.primary;
  const secondary = theme.colors.secondary;
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
  } = useCatalogFilters({ store, products });

  // Featured products for hero carousel (products with images)
  const heroProducts = (products || [])
    .filter((p) => p.imageFileIds && p.imageFileIds.length > 0)
    .slice(0, 5);

  // Auto-advance carousel
  useEffect(() => {
    if (heroProducts.length <= 1 || isCarouselPaused) return;

    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroProducts.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [heroProducts.length, isCarouselPaused]);

  const goToSlide = useCallback((index) => {
    setHeroIndex(index);
  }, []);

  const nextSlide = useCallback(() => {
    setHeroIndex((prev) => (prev + 1) % heroProducts.length);
  }, [heroProducts.length]);

  const prevSlide = useCallback(() => {
    setHeroIndex(
      (prev) => (prev - 1 + heroProducts.length) % heroProducts.length,
    );
  }, [heroProducts.length]);

  // ImageViewer State
  const [viewer, setViewer] = useState({
    isOpen: false,
    images: [],
    index: 0,
  });

  const openViewer = (index, images) => {
    setViewer({ isOpen: true, images, index });
  };

  const handleCategoryClick = (e, catId) => {
    e.stopPropagation();
    toggleCategory(catId);
  };

  return (
    <div
      className="min-h-screen flex flex-col pt-[calc(var(--store-navbar-height)+var(--store-navbar-offset)+env(safe-area-inset-top))] bg-white text-gray-900"
      style={{
        fontFamily,
        colorScheme: "light",
        "--coastal-primary": primary,
        "--coastal-secondary": secondary,
        "--store-navbar-height": "4.5rem",
        "--store-navbar-offset": isPreview ? "2.5rem" : "0rem",
        background: `linear-gradient(180deg, ${secondary} 0%, #f0fdfa 50%, #ecfdf5 100%)`,
      }}
    >
      {/* ========== NAVBAR ========== */}
      <nav
        className={`fixed ${isPreview ? "top-10" : "top-0"} left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100`}
        style={{ height: "var(--store-navbar-height)" }}
      >
        <div className="mx-auto max-w-7xl px-4 h-full flex items-center justify-between gap-4">
          {/* Logo & Name */}
          <div className="flex items-center gap-3 shrink-0">
            {logoUrl ? (
              <div className="w-10 h-10 rounded-xl overflow-hidden">
                <img
                  src={logoUrl}
                  alt={store?.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <Logo
                className="h-8 w-auto"
                style={{ color: primary }}
                variant="icon"
              />
            )}
            <span
              className="font-bold text-xl text-gray-900 truncate max-w-[150px] md:max-w-none"
              style={{ color: primary }}
            >
              {store?.name || "Store"}
            </span>
          </div>

          {/* Desktop Search */}
          <div className="flex-1 max-w-lg mx-4 hidden md:block">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
              />
            </div>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            {store?.paymentLink && (
              <CoastalButton
                variant="primary"
                size="md"
                onClick={() => window.open(store.paymentLink, "_blank")}
              >
                <ExternalLink className="w-4 h-4" />
                Ir a pagar
              </CoastalButton>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-700 hover:text-gray-900 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </nav>

      {/* ========== MOBILE MENU ========== */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-60 bg-black/20 backdrop-blur-sm md:hidden"
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 z-60 w-[85%] max-w-sm bg-white/95 backdrop-blur-xl p-6 pt-20 overflow-y-auto md:hidden shadow-2xl"
            >
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="absolute top-6 right-6 p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Mobile Search */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>
              </div>

              {/* Mobile Filters */}
              <div className="space-y-6">
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
                  setSortOrder={setSortOrder}
                  primaryColor={primary}
                />

                <CoastalButton
                  variant="ghost"
                  onClick={resetFilters}
                  className="w-full"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reiniciar filtros
                </CoastalButton>

                {store?.paymentLink && (
                  <CoastalButton
                    variant="primary"
                    className="w-full"
                    onClick={() => window.open(store.paymentLink, "_blank")}
                  >
                    <ExternalLink className="w-4 h-4" />
                    Ir a pagar
                  </CoastalButton>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ========== HERO CAROUSEL SECTION ========== */}
      {heroProducts.length > 0 && (
        <section className="relative overflow-hidden">
          {/* Background Image with Overlay */}
          <AnimatePresence mode="wait">
            <motion.div
              key={heroIndex}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="absolute inset-0"
            >
              <img
                src={getProductImageUrl(
                  heroProducts[heroIndex]?.imageFileIds?.[0],
                )}
                alt=""
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </motion.div>
          </AnimatePresence>

          {/* Content */}
          <div className="relative z-10 max-w-7xl mx-auto px-4 py-16 md:py-24">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              {/* Left: Product Info */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={heroIndex}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 30 }}
                  transition={{ duration: 0.5 }}
                  className="text-white"
                >
                  {/* Title */}
                  <h2 className="text-3xl md:text-5xl font-bold mb-3 leading-tight">
                    {heroProducts[heroIndex]?.name}
                  </h2>

                  {/* Category */}
                  {heroProducts[heroIndex]?.categories?.[0] && (
                    <p className="text-white/70 text-sm mb-4 flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: primary }}
                      />
                      {heroProducts[heroIndex].categories[0].name}
                    </p>
                  )}

                  {/* Description */}
                  {heroProducts[heroIndex]?.description && (
                    <p className="text-white/80 text-base md:text-lg leading-relaxed mb-6 line-clamp-3 max-w-lg">
                      {heroProducts[heroIndex].description}
                    </p>
                  )}

                  {/* Price */}
                  <div className="mb-8">
                    <span
                      className="text-3xl md:text-4xl font-bold"
                      style={{ color: primary }}
                    >
                      {formatPrice(
                        heroProducts[heroIndex]?.price,
                        heroProducts[heroIndex]?.currency,
                      )}
                    </span>
                  </div>

                  {/* CTA Buttons */}
                  <div className="flex flex-wrap gap-3">
                    <CoastalButton
                      variant="primary"
                      size="lg"
                      onClick={() =>
                        setSelectedProduct(heroProducts[heroIndex])
                      }
                    >
                      Ver Detalles
                    </CoastalButton>
                    <CoastalButton
                      variant="outline"
                      size="lg"
                      className="border-white/30 text-white hover:bg-white hover:text-gray-900"
                      onClick={(e) => {
                        e.stopPropagation();
                        shareProduct(heroProducts[heroIndex]);
                      }}
                    >
                      <Share2 className="w-4 h-4" />
                      Compartir
                    </CoastalButton>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Right: Preview Card */}
              <div className="hidden lg:block">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={heroIndex}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="relative"
                  >
                    {/* Main Card */}
                    <div
                      className="bg-white rounded-3xl overflow-hidden shadow-2xl cursor-pointer transform hover:scale-[1.02] transition-transform duration-300"
                      onClick={() =>
                        setSelectedProduct(heroProducts[heroIndex])
                      }
                    >
                      {/* Image */}
                      <div className="aspect-[4/3] overflow-hidden">
                        <img
                          src={getProductImageUrl(
                            heroProducts[heroIndex]?.imageFileIds?.[0],
                          )}
                          alt={heroProducts[heroIndex]?.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Info */}
                      <div className="p-5">
                        <h3 className="font-bold text-gray-900 text-lg mb-1">
                          {heroProducts[heroIndex]?.name}
                        </h3>
                        {heroProducts[heroIndex]?.description && (
                          <p className="text-gray-500 text-sm line-clamp-2 mb-3">
                            {heroProducts[heroIndex].description}
                          </p>
                        )}
                        <div className="flex items-center justify-between">
                          <span
                            className="text-xl font-bold"
                            style={{ color: primary }}
                          >
                            {formatPrice(
                              heroProducts[heroIndex]?.price,
                              heroProducts[heroIndex]?.currency,
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Next Product Preview (peeking) */}
                    {heroProducts.length > 1 && (
                      <div className="absolute -right-8 top-1/2 -translate-y-1/2 w-48 opacity-40 blur-[1px] pointer-events-none">
                        <div className="bg-white rounded-2xl overflow-hidden shadow-lg">
                          <div className="aspect-[4/3] overflow-hidden">
                            <img
                              src={getProductImageUrl(
                                heroProducts[
                                  (heroIndex + 1) % heroProducts.length
                                ]?.imageFileIds?.[0],
                              )}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Carousel Controls */}
            {heroProducts.length > 1 && (
              <div className="flex items-center justify-center gap-4 mt-10">
                {/* Dots */}
                <div className="flex items-center gap-2">
                  {heroProducts.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => goToSlide(idx)}
                      className={`transition-all duration-300 rounded-full ${
                        idx === heroIndex
                          ? "w-8 h-2"
                          : "w-2 h-2 bg-white/40 hover:bg-white/60"
                      }`}
                      style={
                        idx === heroIndex ? { backgroundColor: primary } : {}
                      }
                      aria-label={`Ir al slide ${idx + 1}`}
                    />
                  ))}
                </div>

                {/* Play/Pause */}
                <button
                  onClick={() => setIsCarouselPaused(!isCarouselPaused)}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                  aria-label={isCarouselPaused ? "Reproducir" : "Pausar"}
                >
                  {isCarouselPaused ? (
                    <Play className="w-4 h-4" />
                  ) : (
                    <Pause className="w-4 h-4" />
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Navigation Arrows */}
          {heroProducts.length > 1 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-all hover:scale-110"
                aria-label="Anterior"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-all hover:scale-110"
                aria-label="Siguiente"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
        </section>
      )}

      {/* ========== SEARCH & FILTERS SECTION ========== */}
      <section className="px-4 py-10">
        <div className="max-w-7xl mx-auto">
          {/* Store Info (only if no hero) */}
          {heroProducts.length === 0 && (
            <div className="text-center mb-10">
              <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
                {store?.name || "Store"}
              </h1>
              {store?.description && (
                <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                  {store.description}
                </p>
              )}
            </div>
          )}

          {/* Search Bar */}
          <div className="max-w-3xl mx-auto mb-8">
            <div
              className="bg-white rounded-2xl shadow-xl p-2 border border-gray-100"
              style={{
                boxShadow: `0 20px 40px -10px ${primary}15`,
              }}
            >
              <div className="flex flex-col md:flex-row gap-2">
                {/* Search Input */}
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar en el catálogo..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-xl text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-teal-500/20 transition-all"
                  />
                </div>

                {/* Sort Select */}
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="px-4 py-4 bg-gray-50 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:bg-white focus:ring-2 focus:ring-teal-500/20 cursor-pointer transition-all"
                >
                  <option value="none">Relevancia</option>
                  <option value="asc">Menor precio</option>
                  <option value="desc">Mayor precio</option>
                </select>

                {/* Search Button */}
                <CoastalButton variant="primary" size="lg">
                  <Search className="w-5 h-5" />
                  <span className="hidden md:inline">Buscar</span>
                </CoastalButton>
              </div>
            </div>
          </div>

          {/* Category Pills - Horizontal Scroll */}
          {categories.length > 0 && (
            <div className="relative">
              <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory px-1">
                {/* All Categories Button */}
                <CategoryPill
                  active={activeCategoryIds.length === 0}
                  icon={Home}
                  onClick={() => {
                    if (activeCategoryIds.length > 0) {
                      resetFilters();
                    }
                  }}
                >
                  Todos
                </CategoryPill>

                {categories.map((cat) => (
                  <CategoryPill
                    key={cat.id}
                    active={activeCategoryIds.includes(cat.id)}
                    onClick={() => toggleCategory(cat.id)}
                  >
                    {cat.name}
                  </CategoryPill>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ========== MAIN CATALOG ========== */}
      <main id="catalog" className="flex-1 px-4 pb-20">
        <div className="max-w-7xl mx-auto">
          {/* Controls Bar */}
          <div className="flex items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5" style={{ color: primary }} />
              <span className="text-sm font-semibold text-gray-700">
                {filteredProducts.length} productos encontrados
              </span>
            </div>

            <div className="hidden md:flex items-center gap-3">
              <CoastalButton
                variant={showFilters ? "primary" : "secondary"}
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-4 h-4" />
                Filtros
              </CoastalButton>

              <CoastalButton variant="ghost" size="sm" onClick={resetFilters}>
                <RotateCcw className="w-4 h-4" />
                Reiniciar
              </CoastalButton>
            </div>
          </div>

          {/* Desktop Filters Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="hidden md:block overflow-hidden mb-8"
              >
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Sort */}
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">
                        Ordenar Por
                      </h3>
                      <select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 cursor-pointer"
                      >
                        <option value="none">Relevancia</option>
                        <option value="asc">Menor precio</option>
                        <option value="desc">Mayor precio</option>
                      </select>
                    </div>

                    {/* Price Range */}
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">
                        Rango de Precio
                      </h3>
                      <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                            $
                          </span>
                          <input
                            type="number"
                            min={0}
                            max={maxPrice}
                            value={minPrice}
                            onChange={(e) =>
                              setMinPrice(Number(e.target.value))
                            }
                            className="w-full pl-7 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                            placeholder="Min"
                          />
                        </div>
                        <span className="text-gray-400">-</span>
                        <div className="relative flex-1">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                            $
                          </span>
                          <input
                            type="number"
                            min={minPrice}
                            max={priceBounds.max}
                            value={maxPrice}
                            onChange={(e) =>
                              setMaxPrice(Number(e.target.value))
                            }
                            className="w-full pl-7 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                            placeholder="Max"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Categories */}
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">
                        Categorías
                      </h3>
                      <div className="flex flex-wrap gap-2 max-h-[100px] overflow-y-auto pr-2">
                        {categories.map((cat) => {
                          const isActive = activeCategoryIds.includes(cat.id);
                          return (
                            <button
                              key={cat.id}
                              onClick={() => toggleCategory(cat.id)}
                              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200 ${
                                isActive
                                  ? "text-white"
                                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                              }`}
                              style={
                                isActive ? { backgroundColor: primary } : {}
                              }
                            >
                              {cat.name}
                            </button>
                          );
                        })}
                        {categories.length === 0 && (
                          <span className="text-sm text-gray-400 italic">
                            Sin categorías
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Product Grid */}
          {filteredProducts && filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {filteredProducts.map((product) => {
                const imageId = product.imageFileIds?.[0];
                const imageUrl = imageId ? getProductImageUrl(imageId) : null;

                return (
                  <CoastalCard
                    key={product.id || product.$id}
                    onClick={() => setSelectedProduct(product)}
                  >
                    {/* Image */}
                    <div className="relative aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-50 overflow-hidden">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <Package className="w-12 h-12" />
                        </div>
                      )}

                      {/* Share Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          shareProduct(product);
                        }}
                        className="absolute top-3 left-3 p-2 bg-white/90 backdrop-blur-sm rounded-full text-gray-600 hover:text-gray-900 hover:bg-white shadow-sm transition-all"
                        aria-label="Compartir producto"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900 line-clamp-2 text-sm md:text-base">
                          {product.name}
                        </h3>
                        <div
                          className="text-lg md:text-xl font-bold shrink-0"
                          style={{ color: primary }}
                        >
                          {formatPrice(product.price, product.currency)}
                        </div>
                      </div>

                      {/* Category Tags */}
                      {product.categories && product.categories.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {product.categories.slice(0, 2).map((cat) => (
                            <button
                              key={cat.id || cat.name}
                              onClick={(e) => handleCategoryClick(e, cat.id)}
                              className="text-[10px] font-medium px-2 py-0.5 rounded-full transition-colors"
                              style={{
                                backgroundColor: `${primary}15`,
                                color: primary,
                              }}
                            >
                              {cat.name}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Description */}
                      {product.description && (
                        <p className="text-xs text-gray-500 line-clamp-2 mb-3">
                          {product.description}
                        </p>
                      )}

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        {typeof product.stock === "number" &&
                        product.stock <= 5 &&
                        product.stock > 0 ? (
                          <span className="text-xs text-orange-600 font-medium">
                            {product.stock} disponibles
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">
                            Disponible
                          </span>
                        )}

                        <button
                          className="text-xs font-semibold transition-colors"
                          style={{ color: primary }}
                        >
                          Ver Detalles
                        </button>
                      </div>
                    </div>
                  </CoastalCard>
                );
              })}
            </div>
          ) : (
            <div className="py-20 text-center">
              <div className="inline-block p-10 bg-white rounded-2xl shadow-lg">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg mb-4">
                  No se encontraron productos
                </p>
                <CoastalButton variant="secondary" onClick={resetFilters}>
                  <RotateCcw className="w-4 h-4" />
                  Reiniciar filtros
                </CoastalButton>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ========== PURCHASE INFO ========== */}
      <div className="max-w-7xl mx-auto px-4 pb-10 w-full">
        <div
          className="bg-white rounded-3xl shadow-xl p-6 md:p-8 border border-gray-100"
          style={{
            boxShadow: `0 20px 40px -10px ${primary}10`,
          }}
        >
          <StorePurchaseInfo store={store} />
        </div>
      </div>

      {/* ========== FOOTER ========== */}
      <footer
        className="py-12 mt-auto border-t border-gray-100"
        style={{
          background: `linear-gradient(180deg, transparent 0%, ${primary}08 100%)`,
        }}
      >
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h4 className="text-2xl font-bold text-gray-900 mb-2">
            {store?.name}
          </h4>
          {store?.description && (
            <p className="text-gray-500 text-sm max-w-md mx-auto mb-6">
              {store.description}
            </p>
          )}

          {store?.paymentLink && (
            <CoastalButton
              variant="primary"
              size="lg"
              onClick={() => window.open(store.paymentLink, "_blank")}
            >
              Ir a pagar
              <ExternalLink className="w-4 h-4" />
            </CoastalButton>
          )}

          {/* Legal Links */}
          <div className="mt-10 pt-6 border-t border-gray-200 flex flex-wrap justify-center gap-x-8 gap-y-3 text-[10px] uppercase tracking-[0.2em] text-gray-400">
            <a
              href={`${appConfig.baseUrl}/legal/privacy`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-600 transition-colors"
            >
              Aviso de Privacidad
            </a>
            <a
              href={`${appConfig.baseUrl}/legal/terms`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-600 transition-colors"
            >
              Términos y Condiciones
            </a>
            <a
              href={`${appConfig.baseUrl}/legal/disclaimer`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-600 transition-colors"
            >
              Deslinde de responsabilidad
            </a>
          </div>

          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-400">
            <span>Powered by</span>
            <a
              href={appConfig.baseUrl}
              className="group flex items-center gap-1.5 hover:opacity-100 transition-opacity"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Logo
                variant="icon"
                asLink={false}
                forcePlatform={true}
                className="h-4 w-auto grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all"
              />
              <span className="font-bold tracking-tight opacity-80 group-hover:opacity-100">
                Catalogy
              </span>
            </a>
          </div>
        </div>
      </footer>

      {/* ========== PRODUCT DETAIL MODAL ========== */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        store={store}
        tone="light"
      />

      {/* ========== IMAGE VIEWER ========== */}
      <ImageViewerModal
        images={viewer.images}
        initialIndex={viewer.index}
        isOpen={viewer.isOpen}
        onClose={() => setViewer({ ...viewer, isOpen: false })}
      />
    </div>
  );
}
