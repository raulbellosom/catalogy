import { useState } from "react";
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
} from "lucide-react";
import { getStoreLogoUrl } from "@/shared/services/storeService";
import { getProductImageUrl } from "@/shared/services/productService";
import {
  ProductDetailModal,
  StoreFooter,
  CatalogFilters,
  StorePurchaseInfo,
  shareProduct,
} from "../components";
import { ImageViewerModal } from "@/shared/ui/molecules/ImageViewerModal";
import { useCatalogFilters } from "../components/catalogHooks";
import { resolveThemeSettings } from "@/templates/registry";
import { Logo } from "@/shared/ui/atoms/Logo";

/**
 * SketchyTemplate
 *
 * A hand-drawn, playful template inspired by mockup aesthetics.
 * Features irregular borders, sketch-like styling, and a whimsical vibe.
 */

const resolveFontFamily = (fontId) => {
  const map = {
    inter: "'Inter', sans-serif",
    merriweather: "'Merriweather', serif",
    jetbrains: "'JetBrains Mono', monospace",
    roboto: "'Roboto', sans-serif",
    playfair: "'Playfair Display', serif",
    montserrat: "'Montserrat', sans-serif",
    cabin: "'Cabin Sketch', cursive",
  };
  return map[fontId] || "'Cabin Sketch', cursive";
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

// Custom sketchy border SVG filter
const SketchyFilter = () => (
  <svg className="absolute w-0 h-0" aria-hidden="true">
    <defs>
      <filter id="sketchy-filter">
        <feTurbulence
          type="turbulence"
          baseFrequency="0.02"
          numOctaves="3"
          result="noise"
        />
        <feDisplacementMap
          in="SourceGraphic"
          in2="noise"
          scale="2"
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>
    </defs>
  </svg>
);

// Sketchy button component
const SketchyButton = ({
  children,
  variant = "primary",
  className = "",
  ...props
}) => {
  const baseStyles =
    "relative h-[42px] px-5 font-bold transition-all duration-200 active:translate-y-0.5 flex items-center justify-center";

  const variants = {
    primary:
      "bg-(--sketchy-primary) text-white border-3 border-black shadow-[4px_4px_0_0_black] hover:shadow-[2px_2px_0_0_black] hover:translate-x-0.5 hover:translate-y-0.5",
    secondary:
      "bg-white text-black border-3 border-black shadow-[4px_4px_0_0_black] hover:shadow-[2px_2px_0_0_black] hover:translate-x-0.5 hover:translate-y-0.5",
    success:
      "bg-[#5cb85c] text-white border-3 border-black shadow-[4px_4px_0_0_black] hover:shadow-[2px_2px_0_0_black] hover:translate-x-0.5 hover:translate-y-0.5",
    info: "bg-[#5bc0de] text-white border-3 border-black shadow-[4px_4px_0_0_black] hover:shadow-[2px_2px_0_0_black] hover:translate-x-0.5 hover:translate-y-0.5",
    warning:
      "bg-[#f0ad4e] text-white border-3 border-black shadow-[4px_4px_0_0_black] hover:shadow-[2px_2px_0_0_black] hover:translate-x-0.5 hover:translate-y-0.5",
    ghost:
      "bg-white text-black border-3 border-black shadow-[4px_4px_0_0_black] hover:shadow-[2px_2px_0_0_black] hover:translate-x-0.5 hover:translate-y-0.5 opacity-70 hover:opacity-100",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

// Sketchy card wrapper
const SketchyCard = ({ children, className = "", onClick, hover = true }) => (
  <div
    onClick={onClick}
    className={`
      relative bg-white border-3 border-black 
      shadow-[6px_6px_0_0_black] 
      ${hover ? "hover:shadow-[3px_3px_0_0_black] hover:translate-x-0.5 hover:translate-y-0.5 cursor-pointer" : ""}
      transition-all duration-200
      ${className}
    `}
  >
    {children}
  </div>
);

// Sketchy input wrapper
const SketchyInput = ({ className = "", ...props }) => (
  <input
    className={`
      w-full px-4 py-3 bg-white border-3 border-black 
      shadow-[3px_3px_0_0_black] 
      focus:shadow-[1px_1px_0_0_black] focus:translate-x-0.5 focus:translate-y-0.5
      outline-none transition-all duration-200
      placeholder:text-gray-400
      ${className}
    `}
    {...props}
  />
);

// Sketchy badge/tag
const SketchyBadge = ({ children, onClick, active = false, color }) => (
  <button
    onClick={onClick}
    className={`
      px-3 py-1 text-xs font-bold uppercase tracking-wider
      border-2 border-black transition-all duration-150
      ${
        active
          ? "bg-black text-white shadow-none translate-x-0.5 translate-y-0.5"
          : "bg-white text-black shadow-[2px_2px_0_0_black] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5"
      }
    `}
    style={
      active && color ? { backgroundColor: color, borderColor: "black" } : {}
    }
  >
    {children}
  </button>
);

export function SketchyTemplate({ store, products, isPreview = false }) {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

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
      className="min-h-screen flex flex-col pt-[calc(var(--store-navbar-height)+var(--store-navbar-offset)+env(safe-area-inset-top))] bg-white text-black"
      style={{
        fontFamily,
        colorScheme: "light",
        "--sketchy-primary": primary,
        "--sketchy-secondary": secondary,
        "--store-navbar-height": "5rem",
        "--store-navbar-offset": isPreview ? "2.5rem" : "0rem",
        backgroundColor: secondary,
      }}
    >
      <SketchyFilter />

      {/* ========== NAVBAR ========== */}
      <nav
        className={`fixed ${isPreview ? "top-10" : "top-0"} left-0 right-0 z-50 bg-[#333] border-b-4 border-black`}
        style={{ height: "var(--store-navbar-height)" }}
      >
        <div className="mx-auto max-w-7xl px-4 h-full flex items-center justify-between gap-4">
          {/* Logo & Name */}
          <div className="flex items-center gap-3 shrink-0">
            {logoUrl ? (
              <div className="w-10 h-10 border-3 border-white/30 bg-white overflow-hidden">
                <img
                  src={logoUrl}
                  alt={store?.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <Logo className="h-6 w-auto text-white" variant="icon" />
            )}
            <span
              className="text-white font-bold text-xl tracking-tight truncate max-w-[150px] md:max-w-none"
              style={{ fontFamily: "'Cabin Sketch', cursive" }}
            >
              {store?.name || "Store"}
            </span>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-6 text-white/80 text-sm font-medium">
            <a href="#catalog" className="hover:text-white transition-colors">
              Productos
            </a>
            {store?.paymentLink && (
              <a
                href={store.paymentLink}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                Pagar
              </a>
            )}
          </div>

          {/* Search */}
          <div className="flex-1 max-w-md mx-4 hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <SketchyInput
                type="text"
                placeholder="Buscar productos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 py-2 text-sm"
              />
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-white hover:text-white/80"
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
              className="fixed inset-0 z-60 bg-black/30 md:hidden"
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 z-60 w-[85%] max-w-sm bg-white border-l-4 border-black p-6 pt-20 overflow-y-auto md:hidden"
            >
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="absolute top-6 right-6 p-2 border-2 border-black"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Mobile Search */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <SketchyInput
                    type="text"
                    placeholder="Buscar..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 py-2 text-sm"
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

                <SketchyButton
                  variant="ghost"
                  onClick={resetFilters}
                  className="w-full flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reiniciar filtros
                </SketchyButton>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ========== HERO SECTION ========== */}
      <header className="px-4 py-12 md:py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-black mb-4 leading-tight"
            style={{ fontFamily: "'Cabin Sketch', cursive" }}
          >
            {store?.name || "Store"}
          </h1>
          {store?.description && (
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              {store.description}
            </p>
          )}

          {/* Quick Category Pills */}
          {categories.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 mt-8">
              {categories.slice(0, 6).map((cat) => (
                <SketchyBadge
                  key={cat.id}
                  onClick={() => toggleCategory(cat.id)}
                  active={activeCategoryIds.includes(cat.id)}
                  color={primary}
                >
                  {cat.name}
                </SketchyBadge>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* ========== MAIN CATALOG ========== */}
      <main id="catalog" className="flex-1 px-4 pb-20">
        <div className="max-w-7xl mx-auto">
          {/* Desktop Controls */}
          <div className="hidden md:flex items-center justify-between gap-4 mb-8 pb-6 border-b-3 border-black">
            <div className="flex items-center gap-4">
              <span className="text-sm font-bold text-gray-600 uppercase tracking-wider">
                {filteredProducts.length} productos
              </span>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="h-[42px] px-5 border-3 border-black bg-white text-sm font-bold shadow-[4px_4px_0_0_black] hover:shadow-[2px_2px_0_0_black] hover:translate-x-0.5 hover:translate-y-0.5 outline-none transition-all cursor-pointer"
              >
                <option value="none">Relevancia</option>
                <option value="asc">Menor precio</option>
                <option value="desc">Mayor precio</option>
              </select>

              <SketchyButton
                variant="secondary"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Filtros
              </SketchyButton>

              <SketchyButton
                variant="ghost"
                onClick={resetFilters}
                className="flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Reiniciar
              </SketchyButton>
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
                <SketchyCard hover={false} className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Sort */}
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">
                        Ordenar Por
                      </h3>
                      <select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                        className="w-full h-[42px] px-4 border-3 border-black bg-white text-sm font-bold shadow-[3px_3px_0_0_black] outline-none cursor-pointer"
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
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">
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
                            className="w-full h-[42px] pl-7 pr-3 border-3 border-black bg-white text-sm font-bold shadow-[3px_3px_0_0_black] outline-none"
                            placeholder="Min"
                          />
                        </div>
                        <span className="text-gray-400 font-bold">-</span>
                        <div className="relative flex-1">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">
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
                            className="w-full h-[42px] pl-7 pr-3 border-3 border-black bg-white text-sm font-bold shadow-[3px_3px_0_0_black] outline-none"
                            placeholder="Max"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Categories - Horizontal pills */}
                    <div className="lg:col-span-1">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">
                        Categorías
                      </h3>
                      <div className="flex flex-wrap gap-2 max-h-[120px] overflow-y-auto pr-2">
                        {categories.map((cat) => {
                          const isActive = activeCategoryIds.includes(cat.id);
                          return (
                            <button
                              key={cat.id}
                              onClick={() => toggleCategory(cat.id)}
                              className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider border-2 border-black transition-all duration-150 ${
                                isActive
                                  ? "bg-black text-white shadow-none translate-x-0.5 translate-y-0.5"
                                  : "bg-white text-black shadow-[2px_2px_0_0_black] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5"
                              }`}
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
                </SketchyCard>
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
                  <SketchyCard
                    key={product.id || product.$id}
                    onClick={() => setSelectedProduct(product)}
                    className="group overflow-hidden"
                  >
                    {/* Image */}
                    <div className="relative aspect-square bg-gray-100 overflow-hidden border-b-3 border-black">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
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
                        className="absolute top-2 right-2 p-2 bg-white border-2 border-black shadow-[2px_2px_0_0_black] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
                        aria-label="Compartir producto"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Content */}
                    <div className="p-3 md:p-4">
                      <h3 className="font-bold text-sm md:text-base text-black line-clamp-2 mb-2">
                        {product.name}
                      </h3>

                      {/* Category Tags */}
                      {product.categories && product.categories.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {product.categories.slice(0, 2).map((cat) => (
                            <button
                              key={cat.id || cat.name}
                              onClick={(e) => handleCategoryClick(e, cat.id)}
                              className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-gray-100 text-gray-600 border border-black/20 hover:bg-black hover:text-white transition-colors"
                            >
                              {cat.name}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Price */}
                      <div
                        className="text-lg md:text-xl font-bold"
                        style={{ color: primary }}
                      >
                        {formatPrice(product.price, product.currency)}
                      </div>

                      {/* Stock Indicator */}
                      {typeof product.stock === "number" &&
                        product.stock <= 5 &&
                        product.stock > 0 && (
                          <p className="text-xs text-orange-600 font-medium mt-1">
                            {product.stock} disponibles
                          </p>
                        )}
                    </div>
                  </SketchyCard>
                );
              })}
            </div>
          ) : (
            <div className="py-20 text-center">
              <SketchyCard hover={false} className="inline-block p-10">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">
                  No se encontraron productos
                </p>
                <SketchyButton
                  variant="ghost"
                  onClick={resetFilters}
                  className="mt-4"
                >
                  Reiniciar filtros
                </SketchyButton>
              </SketchyCard>
            </div>
          )}
        </div>
      </main>

      {/* ========== PURCHASE INFO ========== */}
      <div className="max-w-7xl mx-auto px-4 pb-10 w-full">
        <div className="border-3 border-black bg-white shadow-[6px_6px_0_0_black] p-6 md:p-8">
          <StorePurchaseInfo store={store} />
        </div>
      </div>

      {/* ========== FOOTER ========== */}
      <footer className="bg-[#333] border-t-4 border-black py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h4
            className="text-2xl font-bold text-white mb-2"
            style={{ fontFamily: "'Cabin Sketch', cursive" }}
          >
            {store?.name}
          </h4>
          {store?.description && (
            <p className="text-gray-400 text-sm max-w-md mx-auto mb-6">
              {store.description}
            </p>
          )}

          {store?.paymentLink && (
            <a
              href={store.paymentLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-bold border-3 border-black shadow-[4px_4px_0_0_white] hover:shadow-[2px_2px_0_0_white] hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
            >
              Ir a pagar
              <ExternalLink className="w-4 h-4" />
            </a>
          )}

          <div className="mt-10 pt-6 border-t border-gray-700 text-gray-500 text-xs">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span>Powered by</span>
              <Logo variant="icon" className="h-4 w-auto text-gray-400" />
              <span className="font-bold">Catalogy</span>
            </div>
            <p>Todos los derechos reservados.</p>
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
