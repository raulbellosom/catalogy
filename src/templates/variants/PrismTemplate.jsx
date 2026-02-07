import { useState, useEffect } from "react";
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

export function PrismTemplate({ store, products, isPreview = false }) {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  // Scroll tracking for parallax/gradient effects
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Settings Resolution
  const theme = resolveThemeSettings(store);
  const catalog = resolveCatalogSettings(store);
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
        colorScheme: "dark",
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
        @keyframes holographic {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-orbit { animation: orbit 20s linear infinite; }
        .animate-pulse-glow { animation: pulse-glow 4s ease-in-out infinite; }
        .glass-card {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          position: relative;
          overflow: hidden;
        }
        .glass-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent);
          transition: none;
        }
        .glass-card:hover::before {
          animation: shimmer 0.8s ease-out;
        }
        .glass-card:hover {
          background: rgba(255, 255, 255, 0.06);
          border-color: var(--prism-primary);
          box-shadow: 0 0 30px -5px var(--prism-primary), 0 0 60px -15px var(--prism-primary);
        }
        .text-gradient {
          background: linear-gradient(135deg, #fff 0%, var(--prism-primary) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .holographic-glow {
          background: linear-gradient(
            135deg,
            rgba(255, 0, 150, 0.15) 0%,
            rgba(0, 255, 255, 0.15) 25%,
            rgba(255, 255, 0, 0.15) 50%,
            rgba(0, 255, 150, 0.15) 75%,
            rgba(255, 0, 150, 0.15) 100%
          );
          background-size: 400% 400%;
          animation: holographic 8s ease infinite;
        }
      `}</style>

      {/* Refraction Glow - moves with scroll */}
      <div
        className="fixed pointer-events-none z-0 w-[600px] h-[600px] rounded-full blur-[150px] opacity-20"
        style={{
          background: `radial-gradient(circle, ${primary}, transparent 60%)`,
          left: "50%",
          top: `${Math.max(0, 200 - scrollY * 0.3)}px`,
          transform: "translateX(-50%)",
        }}
      />
      <div
        className="fixed pointer-events-none z-0 w-[400px] h-[400px] rounded-full blur-[120px] opacity-15"
        style={{
          background: `radial-gradient(circle, rgba(59, 130, 246, 0.8), transparent 60%)`,
          right: "-100px",
          top: `${300 + scrollY * 0.1}px`,
        }}
      />

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
        search={
          catalog.showSearch
            ? {
                query: searchQuery,
                onQueryChange: setSearchQuery,
              }
            : null
        }
        onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
      />

      {/* Hero Section */}
      <header className="relative py-20 md:py-28 px-4 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-(--prism-primary)/20 rounded-full blur-[120px] -mr-64 -mt-64 animate-pulse-glow" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] -ml-40 -mb-40" />

        {/* Holographic accent line */}
        <div className="absolute top-1/2 left-0 right-0 h-px holographic-glow opacity-30" />

        <div className="max-w-6xl mx-auto flex flex-col items-center text-center relative z-10">
          {logoUrl ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="mb-8 glass-card rounded-2xl overflow-hidden w-24 h-24 md:w-32 md:h-32 flex items-center justify-center p-4"
            >
              <img
                src={logoUrl}
                alt={store.name}
                className="w-full h-full object-contain"
              />
            </motion.div>
          ) : (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="mb-8 p-6 text-(--prism-primary) glass-card rounded-2xl animate-pulse-glow"
            >
              <Cpu size={48} />
            </motion.div>
          )}

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight text-gradient"
          >
            {store.name}
          </motion.h1>

          {store.description && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-base md:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed line-clamp-2"
            >
              {store.description}
            </motion.p>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10 flex flex-wrap justify-center gap-6"
          >
            <a
              href="#catalog"
              className="group px-10 py-4 bg-(--prism-primary) text-white rounded-xl font-bold shadow-2xl shadow-(--prism-primary)/20 hover:scale-105 hover:shadow-[0_0_40px_rgba(var(--prism-primary),0.4)] transition-all flex items-center gap-3"
            >
              Ver productos{" "}
              <ChevronRight
                size={20}
                className="group-hover:translate-x-1 transition-transform"
              />
            </a>
          </motion.div>
        </div>
      </header>

      {/* Main Content */}
      <main
        id="catalog"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full"
      >
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
          {/* Sidebar / Filters - Hidden on Mobile */}
          {catalog.showFilters && (
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
                    showSort={catalog.showSort}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Product Grid */}
          <div className="flex-1">
            <div className="flex items-end justify-between mb-10 border-b border-white/5 pb-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                  Productos
                </h2>
                <div className="h-1 w-12 bg-(--prism-primary) rounded-full" />
              </div>
              {catalog.showProductCount && (
                <span className="text-xs font-bold tracking-widest text-slate-500 uppercase">
                  {filteredProducts?.length || 0} productos
                </span>
              )}
            </div>

            {filteredProducts && filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 md:gap-6">
                {filteredProducts.map((product, index) => {
                  const imageId = product.imageFileIds?.[0];
                  const imageUrl = imageId ? getProductImageUrl(imageId) : null;

                  const handleCategoryClick = (e, catId) => {
                    e.stopPropagation();
                    toggleCategory(catId);
                  };

                  return (
                    <motion.div
                      key={product.$id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.4,
                        delay: index * 0.05,
                        ease: [0.25, 0.46, 0.45, 0.94],
                      }}
                      onClick={() => setSelectedProduct(product)}
                      className="group cursor-pointer glass-card rounded-2xl overflow-hidden transition-all duration-500"
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

                        {catalog.showShareButton && (
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              shareProduct(product);
                            }}
                            className="absolute right-3 top-3 h-9 w-9 rounded-full bg-white/10 backdrop-blur-md text-white flex items-center justify-center border border-white/20 hover:bg-(--prism-primary) hover:border-(--prism-primary) transition-colors"
                            aria-label="Compartir producto"
                          >
                            <Share2 size={16} />
                          </button>
                        )}

                        {/* Holographic shimmer on hover */}
                        <div className="absolute inset-0 holographic-glow opacity-0 group-hover:opacity-20 transition-opacity duration-500" />

                        {/* Price Overlay */}
                        <div className="absolute inset-x-0 bottom-0 p-4 md:p-6 bg-linear-to-t from-black/80 to-transparent">
                          <span className="text-lg md:text-xl font-bold text-white group-hover:text-(--prism-primary) transition-colors">
                            {formatPrice(product.price, product.currency)}
                          </span>
                        </div>
                      </div>

                      <div className="p-4 md:p-6">
                        <h3 className="text-sm md:text-base font-bold text-white mb-1 group-hover:text-(--prism-primary) transition-colors line-clamp-2">
                          {product.name}
                        </h3>
                        {catalog.showFilters &&
                          product.categories &&
                          product.categories.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3">
                              {product.categories.slice(0, 2).map((cat) => (
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
                          <p className="text-xs md:text-sm text-slate-500 line-clamp-2 mb-4">
                            {product.description}
                          </p>
                        )}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-(--prism-primary) text-[10px] font-black uppercase tracking-[0.2em]">
                            Detalles <ArrowRight size={14} />
                          </div>
                          {product.stock > 0 && (
                            <div className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">
                              {product.stock} disponibles
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
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
                  No hay productos que coincidan con tu búsqueda.
                </p>
                <button
                  onClick={resetFilters}
                  className="px-8 py-3 glass-card rounded-xl text-sm font-bold text-(--prism-primary) transition-all hover:bg-(--prism-primary) hover:text-white"
                >
                  Reiniciar filtros
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {catalog.showPurchaseInfo && (
        <StorePurchaseInfo
          store={store}
          tone="dark"
          showPaymentButton={catalog.showPaymentButton}
          wrapperClassName="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 w-full"
        />
      )}
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
              className="fixed inset-y-0 right-0 z-60 w-[85%] bg-(--prism-bg) p-6 pt-24 shadow-2xl overflow-y-auto md:hidden border-l border-white/10"
            >
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="absolute top-8 right-8 p-2 glass-card rounded-full text-white"
              >
                <X size={24} />
              </button>

              <div className="space-y-12">
                {(catalog.showSearch || catalog.showFilters) && (
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
                    {catalog.showSearch && (
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                        <input
                          type="search"
                          value={searchQuery}
                          onChange={(event) =>
                            setSearchQuery(event.target.value)
                          }
                          placeholder="Buscar..."
                          className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none border border-white/10 bg-white/5 text-white placeholder:text-slate-500"
                        />
                      </div>
                    )}
                    {catalog.showFilters && (
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
                        showSort={catalog.showSort}
                      />
                    )}
                  </div>
                )}

                {store?.paymentLink && catalog.showPaymentButton && (
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
        showShareButton={catalog.showShareButton}
        showPaymentButton={catalog.showPaymentButton}
      />
    </div>
  );
}
