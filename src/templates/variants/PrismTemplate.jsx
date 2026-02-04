import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  X,
  Layers,
  Cpu,
  ChevronRight,
  Filter,
  ArrowRight,
  Monitor,
  ExternalLink,
  Share2,
} from "lucide-react";
import { getStoreLogoUrl } from "@/shared/services/storeService";
import { getProductImageUrl } from "@/shared/services/productService";
import {
  ProductDetailModal,
  StoreNavbar,
  StoreFooter,
  CatalogFilters,
  StorePurchaseInfo,
  shareProduct,
} from "../components";
import { ImageViewerModal } from "@/shared/ui/molecules/ImageViewerModal";
import { useCatalogFilters } from "../components/catalogHooks";
import { resolveThemeSettings } from "@/templates/registry";

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
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export function PrismTemplate({ store, products, isPreview = false }) {
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

  return (
    <div
      className="min-h-screen flex flex-col bg-(--prism-bg) text-white selection:bg-(--prism-primary)/30 pt-[calc(var(--store-navbar-height)+var(--store-navbar-offset)+env(safe-area-inset-top))]"
      style={{
        fontFamily,
        "--prism-primary": primary,
        "--prism-secondary": secondary,
        "--prism-bg": secondary || "#0f172a",
        "--store-navbar-height": "4rem",
        "--store-navbar-offset": isPreview ? "2.5rem" : "0rem",
      }}
    >
      <style>{`
        @keyframes orbit {
          from { transform: rotate(0deg) translateX(100px) rotate(0deg); }
          to { transform: rotate(360deg) translateX(100px) rotate(-360deg); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
        .animate-orbit { animation: orbit 20s linear infinite; }
        .animate-pulse-glow { animation: pulse-glow 4s ease-in-out infinite; }
        .glass-card {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }
        .glass-card:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: var(--prism-primary);
          box-shadow: 0 0 20px -5px var(--prism-primary);
        }
        .text-gradient {
          background: linear-gradient(135deg, #fff 0%, var(--prism-primary) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      `}</style>

      <StoreNavbar
        store={store}
        isPreview={isPreview}
        config={{
          bg: "bg-(--prism-bg)/80",
          text: "text-white",
          border: "border-white/10",
          accent: "text-(--prism-primary)",
          glass: true,
        }}
        search={{
          query: searchQuery,
          onQueryChange: setSearchQuery,
        }}
        onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
      />

      {/* Hero Section */}
      <header className="relative py-24 px-4 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-(--prism-primary)/20 rounded-full blur-[120px] -mr-64 -mt-64 animate-pulse-glow" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] -ml-40 -mb-40" />

        <div className="max-w-6xl mx-auto flex flex-col items-center text-center relative z-10">
          <div className="h-20" />

          {logoUrl ? (
            <div className="mb-8 glass-card rounded-2xl overflow-hidden w-24 h-24 md:w-32 md:h-32 flex items-center justify-center p-4">
              <img
                src={logoUrl}
                alt={store.name}
                className="w-full h-full object-contain"
              />
            </div>
          ) : (
            <div className="mb-8 p-6 text-(--prism-primary) glass-card rounded-2xl animate-pulse-glow">
              <Cpu size={48} />
            </div>
          )}

          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight text-gradient">
            {store.name}
          </h1>

          {store.description && (
            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              {store.description}
            </p>
          )}

          <div className="mt-12 flex flex-wrap justify-center gap-6">
            <a
              href="#catalog"
              className="px-10 py-4 bg-(--prism-primary) text-white rounded-xl font-bold shadow-2xl shadow-(--prism-primary)/20 hover:scale-105 transition-all flex items-center gap-3"
            >
              Ver productos <ChevronRight size={20} />
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main
        id="catalog"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full"
      >
        <div className="flex flex-col lg:flex-row gap-16">
          {/* Sidebar / Filters - Hidden on Mobile */}
          <div className="hidden lg:block lg:w-80 shrink-0">
            <div className="sticky top-28 space-y-10">
              <div className="glass-card rounded-3xl p-8">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
                    <Filter size={14} /> Filtros
                  </h3>
                  <button
                    onClick={resetFilters}
                    className="text-[10px] font-bold uppercase tracking-[0.2em] text-(--prism-primary)"
                  >
                    Reiniciar
                  </button>
                </div>
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
                  dark={true}
                />
              </div>
            </div>
          </div>

          {/* Product Grid */}
          <div className="flex-1">
            <div className="flex items-end justify-between mb-12 border-b border-white/5 pb-8">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">
                  Productos
                </h2>
                <div className="h-1 w-12 bg-(--prism-primary) rounded-full" />
              </div>
              <span className="text-xs font-bold tracking-widest text-slate-500 uppercase">
                {filteredProducts?.length || 0} productos
              </span>
            </div>

            {filteredProducts && filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6 md:gap-10">
                {filteredProducts.map((product) => {
                  const imageId = product.imageFileIds?.[0];
                  const imageUrl = imageId ? getProductImageUrl(imageId) : null;

                  const handleCategoryClick = (e, catId) => {
                    e.stopPropagation();
                    toggleCategory(catId);
                  };

                  return (
                    <div
                      key={product.$id}
                      onClick={() => setSelectedProduct(product)}
                      className="group cursor-pointer glass-card rounded-3xl overflow-hidden transition-all duration-500"
                    >
                      <div className="aspect-4/5 overflow-hidden relative">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-slate-800/50">
                            <Layers className="w-12 h-12 text-slate-700" />
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            shareProduct(product);
                          }}
                          className="absolute right-3 top-3 h-9 w-9 rounded-full bg-white/90 text-slate-900 flex items-center justify-center shadow-sm hover:shadow-md transition-shadow"
                          aria-label="Compartir producto"
                        >
                          <Share2 size={16} />
                        </button>

                        {/* Price Overlay */}
                        <div className="absolute inset-x-0 bottom-0 p-6 bg-linear-to-t from-black/80 to-transparent">
                          <span className="text-xl font-bold text-white group-hover:text-(--prism-primary) transition-colors">
                            {formatPrice(product.price, product.currency)}
                          </span>
                        </div>
                      </div>

                      <div className="p-8">
                        <h3 className="text-lg font-bold text-white mb-1 group-hover:text-(--prism-primary) transition-colors line-clamp-1">
                          {product.name}
                        </h3>
                        {product.categories &&
                          product.categories.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3">
                              {product.categories.map((cat) => (
                                <button
                                  key={cat.id || cat.name}
                                  onClick={(e) =>
                                    handleCategoryClick(e, cat.id)
                                  }
                                  className="text-[8px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded bg-white/5 text-white/40 hover:bg-(--prism-primary) hover:text-white transition-colors"
                                >
                                  {cat.name}
                                </button>
                              ))}
                            </div>
                          )}
                        {product.description && (
                          <p className="text-sm text-slate-500 line-clamp-2 mb-6 h-10">
                            {product.description}
                          </p>
                        )}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-(--prism-primary) text-[10px] font-black uppercase tracking-[0.2em]">
                            Detalles <ArrowRight size={14} />
                          </div>
                          {product.stock > 0 && (
                            <div className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">
                              {product.stock} EN STOCK
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-32 text-center">
                <div className="w-24 h-24 glass-card rounded-full flex items-center justify-center mb-8 animate-pulse-glow">
                  <Monitor className="w-10 h-10 text-slate-700" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">
                  Sin productos
                </h3>
                <p className="text-slate-500 max-w-md mx-auto mb-10">
                  No hay productos que coincidan con tu b?squeda.
                </p>
                <button
                  onClick={() => setSearchQuery("")}
                  className="px-8 py-3 glass-card rounded-xl text-sm font-bold text-(--prism-primary) transition-all hover:bg-(--prism-primary) hover:text-white"
                >
                  Reiniciar filtros
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 w-full">
        <StorePurchaseInfo store={store} />
      </div>
      <StoreFooter
        store={store}
        config={{
          bg: "bg-black/90",
          text: "text-slate-500",
          border: "border-white/5",
          muted: "text-slate-600",
          accent: "text-white",
        }}
      />

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-60 bg-black/60 backdrop-blur-sm md:hidden"
            />

            {/* Menu Sidebar */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 z-60 w-[85%] bg-(--prism-bg) p-6 pt-24 shadow-2xl overflow-y-auto md:hidden"
            >
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="absolute top-8 right-8 p-2 glass-card rounded-full text-white"
              >
                <X size={24} />
              </button>

              <div className="space-y-12">
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">
                      Búsqueda y Filtros
                    </h3>
                    <button
                      onClick={resetFilters}
                      className="text-[10px] font-bold uppercase tracking-widest text-(--prism-primary)"
                    >
                      Reiniciar
                    </button>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <input
                      type="search"
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      placeholder="Buscar..."
                      className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none border border-white/10 bg-white/5 text-white placeholder:text-slate-500"
                    />
                  </div>
                  <CatalogFilters
                    categories={categories}
                    activeCategoryIds={activeCategoryIds}
                    onToggleCategory={(id) => {
                      toggleCategory(id);
                    }}
                    minPrice={minPrice}
                    maxPrice={maxPrice}
                    onMinPriceChange={setMinPrice}
                    onMaxPriceChange={setMaxPrice}
                    priceBounds={priceBounds}
                    sortOrder={sortOrder}
                    setSortOrder={setSortOrder}
                    primaryColor={primary}
                    dark={true}
                  />
                </div>

                {store?.paymentLink && (
                  <div className="pt-8 border-t border-white/10">
                    <a
                      href={store.paymentLink}
                      target="_blank"
                      className="w-full py-4 bg-(--prism-primary) text-white rounded-2xl font-bold flex items-center justify-center gap-2 whitespace-nowrap"
                    >
                      <ExternalLink size={20} /> Ir al pago
                    </a>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

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
        tone="prism"
      />
    </div>
  );
}
