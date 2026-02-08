import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView } from "motion/react";
import {
  Search,
  Grid,
  Maximize2,
  X,
  Share2,
  ExternalLink,
  SlidersHorizontal,
  ArrowRight,
} from "lucide-react";
import { getStoreLogoUrl } from "@/shared/services/storeService";
import { getProductImageUrl } from "@/shared/services/productService";
import {
  ProductDetailModal,
  StoreNavbar,
  StoreFooter,
  StorePurchaseInfo,
  shareProduct,
} from "../components";
import { ImageViewerModal } from "@/shared/ui/molecules/ImageViewerModal";
import { useCatalogFilters } from "../components/catalogHooks";
import { resolveThemeSettings } from "@/templates/registry";
import { resolveCatalogSettings } from "@/shared/utils/storeSettings";

const resolveFontFamily = (fontId) => {
  const map = {
    inter: "'Inter', sans-serif",
    merriweather: "'Merriweather', serif",
    jetbrains: "'JetBrains Mono', monospace",
    roboto: "'Roboto', sans-serif",
    playfair: "'Playfair Display', serif",
    montserrat: "'Montserrat', sans-serif",
  };
  return map[fontId] || "'Inter', sans-serif";
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

export function GalleryTemplate({ store, products, isPreview = false }) {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Settings Resolution
  const theme = resolveThemeSettings(store);
  const catalog = resolveCatalogSettings(store);
  const fontFamily = resolveFontFamily(theme.font);
  const primary = theme.colors.primary;
  const secondary = theme.colors.secondary;

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

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ImageViewer
  const [viewer, setViewer] = useState({
    isOpen: false,
    images: [],
    index: 0,
  });

  const openViewer = (index, images, e) => {
    e.stopPropagation();
    setViewer({ isOpen: true, images, index });
  };

  return (
    <div
      className="min-h-screen flex flex-col bg-stone-50 text-stone-900"
      style={{
        fontFamily,
        colorScheme: "light",
        "--gallery-accent": primary,
        "--gallery-contrast": secondary,
        "--store-navbar-offset": isPreview ? "2.5rem" : "0rem",
      }}
    >
      <style>{`
        .gallery-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            grid-auto-flow: dense;
            gap: 1px;
        }
        @media (min-width: 768px) {
            .gallery-grid {
                grid-template-columns: repeat(3, 1fr);
            }
        }
        @media (min-width: 1024px) {
            .gallery-grid {
                grid-template-columns: repeat(4, 1fr);
            }
        }
        .gallery-item-large {
            grid-column: span 2;
            grid-row: span 2;
        }
        .gallery-item-wide {
            grid-column: span 2;
        }
        .gallery-item-tall {
           grid-row: span 2;
        }
        
        /* Custom Scrollbar for Drawer */
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
        .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
      `}</style>

      {/* Navbar */}
      <nav
        className={`fixed left-0 right-0 z-40 transition-all duration-500 ${
          scrolled
            ? "bg-white/90 backdrop-blur-md border-b border-stone-100 py-4"
            : "bg-transparent py-6"
        }`}
        style={{ top: "var(--store-navbar-offset, 0px)" }}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          {/* Brand */}
          <div className="text-xl font-bold tracking-tight">
            {store.logoFileId ? (
              <img
                src={getStoreLogoUrl(store.logoFileId)}
                alt={store.name}
                className="h-8 md:h-10 w-auto object-contain"
              />
            ) : (
              <span>{store.name}</span>
            )}
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-6 text-sm font-medium tracking-wide">
            <button
              onClick={() => setIsFilterOpen(true)}
              className="flex items-center gap-2 hover:text-[var(--gallery-accent)] transition-colors"
            >
              <SlidersHorizontal size={16} />
              <span>FILTROS</span>
            </button>
            {catalog.showSearch && (
              <button
                onClick={() => setIsFilterOpen(true)}
                className="hover:text-[var(--gallery-accent)] transition-colors"
              >
                <Search size={18} />
              </button>
            )}
          </div>

          {/* Mobile Menu Trigger */}
          <div className="lg:hidden flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 -mr-2"
            >
              <Search size={22} />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero / Header Space */}
      <header className="pt-32 pb-12 px-6 text-center">
        <h1 className="text-4xl md:text-5xl font-light mb-4">{store.name}</h1>
        {store.description && (
          <p className="max-w-2xl mx-auto text-stone-500 font-light text-lg">
            {store.description}
          </p>
        )}

        {/* Helper text for empty results */}
        {(!filteredProducts || filteredProducts.length === 0) && (
          <div className="mt-12">
            <p className="text-stone-400 mb-4">No se encontraron productos.</p>
            <button
              onClick={resetFilters}
              className="text-sm font-medium underline"
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </header>

      {/* Main Gallery Grid */}
      <main className="flex-grow w-full max-w-[1920px] mx-auto px-1 md:px-0 pb-20">
        {/* Elegant Category Tabs */}
        {catalog.showFilters && categories.length > 0 && (
          <div className="flex justify-center mb-12 px-4">
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 border-b border-stone-200 px-8">
              <button
                onClick={resetFilters}
                className={`pb-4 text-xs font-bold uppercase tracking-[0.2em] transition-all relative ${
                  activeCategoryIds.length === 0
                    ? "text-stone-900"
                    : "text-stone-400 hover:text-stone-600"
                }`}
              >
                Todas
                {activeCategoryIds.length === 0 && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-stone-900"
                  />
                )}
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => toggleCategory(cat.id)}
                  className={`pb-4 text-xs font-bold uppercase tracking-[0.2em] transition-all relative ${
                    activeCategoryIds.includes(cat.id)
                      ? "text-stone-900"
                      : "text-stone-400 hover:text-stone-600"
                  }`}
                >
                  {cat.name}
                  {activeCategoryIds.includes(cat.id) && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-stone-900"
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="gallery-grid">
          {filteredProducts &&
            filteredProducts.map((product, idx) => {
              // Determine varied sizes based on index for visual rhythm
              let sizeClass = "";
              const patternIndex = idx % 10;
              if (patternIndex === 0) sizeClass = "gallery-item-large";
              else if (patternIndex === 4) sizeClass = "gallery-item-wide";
              else if (patternIndex === 7) sizeClass = "gallery-item-tall";

              const imageUrl = product.imageFileIds?.[0]
                ? getProductImageUrl(product.imageFileIds[0])
                : null;

              return (
                <motion.div
                  key={product.$id}
                  layoutId={product.$id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className={`group relative bg-white overflow-hidden aspect-square ${sizeClass} cursor-pointer`}
                  onClick={() => setSelectedProduct(product)}
                >
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-stone-100 text-stone-300">
                      <Grid size={40} strokeWidth={1} />
                    </div>
                  )}

                  {product.isFeatured && (
                    <div className="absolute top-3 left-3 z-10 bg-black/80 backdrop-blur-sm px-2 py-1">
                      <span className="text-[10px] text-white uppercase tracking-wider font-bold">
                        Destacado
                      </span>
                    </div>
                  )}

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                    <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                      <h3 className="text-white text-lg font-medium mb-1">
                        {product.name}
                      </h3>
                      <p className="text-white/80 font-light mb-4">
                        {formatPrice(product.price, product.currency)}
                      </p>

                      <div className="flex items-center gap-3">
                        <button className="bg-white text-black px-4 py-2 text-xs font-bold tracking-wider uppercase hover:bg-stone-200 transition-colors">
                          Ver Detalles
                        </button>
                        {imageUrl && (
                          <button
                            onClick={(e) =>
                              openViewer(
                                0,
                                product.imageFileIds.map((id) =>
                                  getProductImageUrl(id),
                                ),
                                e,
                              )
                            }
                            className="p-2 bg-white/20 text-white hover:bg-white/40 rounded-full transition-colors"
                          >
                            <Maximize2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
        </div>
      </main>

      {/* Filter Drawer (Desktop/Tablet) */}
      <AnimatePresence>
        {isFilterOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFilterOpen(false)}
              className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm hidden lg:block"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30 }}
              className="fixed inset-y-0 right-0 z-50 w-[320px] bg-white shadow-2xl flex flex-col border-l border-stone-100 overflow-hidden"
              style={{ top: "var(--store-navbar-offset, 0px)" }}
            >
              <div className="flex justify-between items-center p-6 border-b border-stone-100">
                <h2 className="text-xl font-light tracking-wide">Filtros</h2>
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="hover:rotate-90 transition-transform p-1"
                >
                  <X size={24} strokeWidth={1.5} />
                </button>
              </div>

              <div className="flex-grow overflow-y-auto p-6 space-y-8 scrollbar-hide overflow-x-hidden">
                {/* Search */}
                {catalog.showSearch && (
                  <div className="space-y-3">
                    <label className="text-xs font-bold uppercase tracking-widest text-stone-400">
                      Buscar
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Buscar..."
                        className="w-full bg-stone-50 border-b border-stone-200 py-2 pl-2 pr-8 text-sm focus:outline-none focus:border-black transition-colors"
                      />
                      <Search
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400"
                        size={16}
                      />
                    </div>
                  </div>
                )}

                {/* Categories */}
                {categories.length > 0 && (
                  <div className="space-y-3">
                    <label className="text-xs font-bold uppercase tracking-widest text-stone-400">
                      Categorías
                    </label>
                    <div className="flex flex-col gap-2">
                      {categories.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => toggleCategory(cat.id)}
                          className={`text-left text-sm py-1 transition-colors break-words w-full ${activeCategoryIds.includes(cat.id) ? "text-black font-semibold pl-2 border-l-2 border-black" : "text-stone-500 hover:text-black"}`}
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Price */}
                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-widest text-stone-400">
                    Precio
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      value={minPrice}
                      onChange={(e) => setMinPrice(Number(e.target.value))}
                      placeholder="Min"
                      className="w-full bg-stone-50 border border-stone-200 px-3 py-2 text-sm rounded min-w-0"
                    />
                    <span className="text-stone-400">-</span>
                    <input
                      type="number"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(Number(e.target.value))}
                      placeholder="Max"
                      className="w-full bg-stone-50 border border-stone-200 px-3 py-2 text-sm rounded min-w-0"
                    />
                  </div>
                </div>

                {/* Sort */}
                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-widest text-stone-400">
                    Ordenar
                  </label>
                  <div className="relative">
                    <select
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 px-3 py-2 text-sm rounded outline-none appearance-none"
                    >
                      <option value="">Relevancia</option>
                      <option value="price-asc">Menor precio</option>
                      <option value="price-desc">Mayor precio</option>
                      <option value="newest">Más nuevos</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg
                        className="w-4 h-4 text-stone-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {hasFeaturedProducts && (
                  <div className="space-y-3">
                    <label className="text-xs font-bold uppercase tracking-widest text-stone-400">
                      Destacados
                    </label>
                    <button
                      onClick={toggleFeaturedOnly}
                      className={`w-full py-2 border text-sm transition-all ${
                        showFeaturedOnly
                          ? "bg-black text-white border-black"
                          : "bg-white text-stone-500 border-stone-200 hover:border-black hover:text-black"
                      }`}
                    >
                      {showFeaturedOnly ? "Ver Todos" : "Ver Solo Destacados"}
                    </button>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-stone-100 bg-white">
                <button
                  onClick={resetFilters}
                  className="w-full py-3 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-stone-800 transition-colors"
                >
                  Limpiar Filtros
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Mobile Menu (Combined Nav + Filters) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm lg:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30 }}
              className="fixed inset-y-0 left-0 z-50 w-[85%] max-w-sm bg-white shadow-2xl flex flex-col lg:hidden overflow-hidden"
              style={{ top: "var(--store-navbar-offset, 0px)" }}
            >
              <div className="flex justify-between items-center p-6 border-b border-stone-100">
                <div className="text-lg font-bold">{store.name}</div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Mobile Filters Content - Reusing logic but stacking */}
              <div className="flex-grow overflow-y-auto p-6 space-y-8 pb-8 overflow-x-hidden">
                {/* Search */}
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar productos..."
                    className="w-full bg-stone-50 border border-stone-200 px-4 py-3 rounded-lg text-sm focus:border-black outline-none"
                  />
                  <Search
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400"
                    size={18}
                  />
                </div>

                {/* Categories */}
                {categories.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-3">Categorías</h3>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => {
                            toggleCategory(cat.id);
                            setIsMobileMenuOpen(false);
                          }}
                          className={`px-3 py-1.5 text-sm rounded-full border break-words max-w-full ${activeCategoryIds.includes(cat.id) ? "bg-black text-white border-black" : "bg-white text-stone-600 border-stone-200"}`}
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={resetFilters}
                  className="text-sm text-stone-500 underline w-full text-left"
                >
                  Limpiar filtros
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Footer */}
      <div className="mt-auto">
        <StoreFooter store={store} />
      </div>

      {/* Modals */}
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
        tone="gallery"
        showShareButton={catalog.showShareButton}
        showPaymentButton={catalog.showPaymentButton}
      />
    </div>
  );
}
