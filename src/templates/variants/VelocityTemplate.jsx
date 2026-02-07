import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  ChevronRight,
  Gauge,
  ExternalLink,
  Share2,
  Search,
} from "lucide-react";
import {
  CatalogControls,
  ProductDetailModal,
  StoreNavbar,
  StoreFooter,
  StorePurchaseInfo,
  shareProduct,
} from "../components";
import { getStoreLogoUrl } from "@/shared/services/storeService";
import { getProductImageUrl } from "@/shared/services/productService";
import { resolveThemeSettings } from "@/templates/registry";
import { resolveCatalogSettings } from "@/shared/utils/storeSettings";
import { useCatalogFilters } from "../components/catalogHooks";

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

export function VelocityTemplate({ store, products, isPreview = false }) {
  const {
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
    categories,
    sortOrder,
    setSortOrder,
    resetFilters,
  } = useCatalogFilters({ store, products });

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [scrollY, setScrollY] = useState(0);

  // Scroll tracking for parallax
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const theme = resolveThemeSettings(store);
  const catalog = resolveCatalogSettings(store);
  const primaryColor = theme.colors.primary;
  const secondaryColor = theme.colors.secondary;
  const fontFamily = resolveFontFamily(theme.font);

  return (
    <div
      className="min-h-screen text-slate-900 pt-[calc(var(--store-navbar-height)+var(--store-navbar-offset)+env(safe-area-inset-top))]"
      style={{
        backgroundColor: secondaryColor,
        fontFamily,
        colorScheme: "light",
        "--velocity-accent": primaryColor,
        "--color-primary": primaryColor,
        "--color-bg-secondary": secondaryColor,
        "--color-border": `${primaryColor}40`,
        "--color-fg": "#0f172a",
        "--store-navbar-height": "4rem",
        "--store-navbar-offset": isPreview ? "2.5rem" : "0rem",
      }}
    >
      <style>{`
        .velocity-clip {
          clip-path: polygon(0 0, 100% 0, 100% 85%, 95% 100%, 0 100%);
        }
        .velocity-btn {
          background: var(--velocity-accent);
          color: white;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          clip-path: polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px);
          transition: all 0.2s;
        }
        .velocity-btn:hover {
          filter: brightness(1.1);
          transform: skewX(-5deg);
        }
        @keyframes speedline {
          0% { transform: translateX(-100%); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateX(200%); opacity: 0; }
        }
        .speed-line {
          animation: speedline 2s ease-in-out infinite;
        }
        .speed-line-1 { animation-delay: 0s; }
        .speed-line-2 { animation-delay: 0.3s; }
        .speed-line-3 { animation-delay: 0.6s; }
        .speed-line-4 { animation-delay: 0.9s; }
        .velocity-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .velocity-card:hover {
          transform: translateY(-8px) skewX(-1deg);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }
      `}</style>

      {/* Shared Navbar */}
      <StoreNavbar
        store={store}
        isPreview={isPreview}
        onMobileMenuToggle={() => setIsMobileMenuOpen(true)}
        search={
          catalog.showSearch
            ? {
                query: searchQuery,
                onQueryChange: setSearchQuery,
              }
            : null
        }
        config={{
          bg: "bg-slate-900",
          text: "text-white",
          border: "border-white/10",
          accent: "text-(--velocity-accent)",
          glass: false,
        }}
        actions={
          <div className="hidden md:flex gap-8 text-sm font-semibold tracking-wide border-b border-white/20 pb-2">
            <button
              onClick={() =>
                window.scrollTo({
                  top: window.innerHeight,
                  behavior: "smooth",
                })
              }
              className="hover:text-(--velocity-accent) transition-colors"
            >
              CATÁLOGO
            </button>
          </div>
        }
      />

      {/* Dynamic Header / Hero */}
      <header className="relative bg-slate-900 text-white overflow-hidden pt-16">
        {/* Speed Lines Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage:
                "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
              backgroundSize: "40px 40px",
              transform: `translateY(${scrollY * 0.1}px)`,
            }}
          />
          {/* Animated speed lines */}
          <div className="absolute top-1/4 left-0 right-0 h-px bg-linear-to-r from-transparent via-white/30 to-transparent speed-line speed-line-1" />
          <div className="absolute top-1/3 left-0 right-0 h-0.5 bg-linear-to-r from-transparent via-(--velocity-accent)/40 to-transparent speed-line speed-line-2" />
          <div className="absolute top-1/2 left-0 right-0 h-px bg-linear-to-r from-transparent via-white/20 to-transparent speed-line speed-line-3" />
          <div className="absolute top-2/3 left-0 right-0 h-0.5 bg-linear-to-r from-transparent via-(--velocity-accent)/30 to-transparent speed-line speed-line-4" />
        </div>

        <div className="relative max-w-[1440px] mx-auto px-6 py-8">
          <div className="grid md:grid-cols-2 gap-12 items-center py-12 md:py-24">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="order-2 md:order-1 space-y-6"
            >
              <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter leading-[0.9]">
                {store.name}
              </h1>
              {store.description && (
                <p className="text-slate-400 text-lg max-w-md font-medium line-clamp-2">
                  {store.description}
                </p>
              )}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                onClick={() =>
                  window.scrollTo({
                    top: window.innerHeight,
                    behavior: "smooth",
                  })
                }
                className="mt-8 px-8 py-4 bg-(--velocity-accent) text-white font-bold uppercase tracking-wider hover:bg-white hover:text-black transition-colors skew-x-[-10deg] group"
              >
                <span className="skew-x-10 flex items-center gap-2">
                  Explorar
                  <ChevronRight
                    className="group-hover:translate-x-1 transition-transform"
                    size={20}
                  />
                </span>
              </motion.button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="order-1 md:order-2 relative h-[300px] md:h-[500px] w-full"
              style={{ transform: `translateY(${scrollY * -0.1}px)` }}
            >
              {/* Abstract decorative shape or logo if available */}
              <div className="absolute inset-0 bg-linear-to-tr from-(--velocity-accent)/20 to-transparent rounded-full blur-3xl transform translate-x-12"></div>
              {store.logoFileId ? (
                <img
                  src={getStoreLogoUrl(store.logoFileId)}
                  className="w-full h-full object-contain filter drop-shadow-2xl"
                  alt="Logo"
                />
              ) : (
                // Placeholder abstract graphic
                <div className="w-full h-full flex items-center justify-center border border-white/10 bg-white/5 backdrop-blur-sm skew-x-[-5deg]">
                  <Gauge size={120} className="text-white/20" strokeWidth={1} />
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </header>

      {/* Showroom / Content */}
      <main className="max-w-[1600px] mx-auto px-4 md:px-8 py-16">
        {/* Controls Bar */}
        {(catalog.showSearch || catalog.showFilters) && (
          <div className="bg-white p-4 shadow-xl border border-slate-100 rounded-sm mb-12 sticky top-20 z-30 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="w-full md:w-auto flex-1">
              <CatalogControls
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                activeCategoryIds={activeCategoryIds}
                onToggleCategory={toggleCategory}
                minPrice={minPrice}
                maxPrice={maxPrice}
                onMinPriceChange={setMinPrice}
                onMaxPriceChange={setMaxPrice}
                priceBounds={priceBounds}
                sortOrder={sortOrder}
                setSortOrder={setSortOrder}
                categories={categories}
                tone="noir"
                onReset={resetFilters}
                showSearch={catalog.showSearch}
                showFilters={catalog.showFilters}
                showSort={catalog.showSort}
                showPrice={catalog.showFilters}
                showCategories={catalog.showFilters}
              />
            </div>
            {catalog.showProductCount && (
              <div className="text-xs font-bold uppercase text-slate-400 hidden md:block">
                {filteredProducts ? filteredProducts.length : 0} Productos
              </div>
            )}
          </div>
        )}

        {/* Wide Grid Layout */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          {filteredProducts &&
            filteredProducts.map((product, index) => (
              <motion.div
                key={product.$id}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.4,
                  delay: index * 0.05,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
                className="group velocity-card bg-white rounded-lg border border-slate-200 overflow-hidden flex flex-col cursor-pointer"
                onClick={() => setSelectedProduct(product)}
              >
                {/* Image Area - Aspect Ratio 16/9 for cinematic feel */}
                <div className="relative aspect-video bg-slate-100 overflow-hidden">
                  {product.imageFileIds?.[0] ? (
                    <img
                      src={getProductImageUrl(product.imageFileIds[0])}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <Gauge size={48} className="text-slate-300" />
                    </div>
                  )}

                  {catalog.showShareButton && (
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        shareProduct(product);
                      }}
                      className="absolute right-3 top-3 h-9 w-9 rounded-full bg-white/90 text-slate-900 flex items-center justify-center shadow-sm hover:shadow-md hover:bg-(--velocity-accent) hover:text-white transition-all"
                      aria-label="Compartir producto"
                    >
                      <Share2 size={16} />
                    </button>
                  )}

                  {/* Status Badge */}
                  <div className="absolute top-4 left-4">
                    {product.stock > 0 ? (
                      <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 uppercase rounded-sm">
                        Disponible
                      </span>
                    ) : (
                      <span className="bg-slate-500 text-white text-[10px] font-bold px-2 py-1 uppercase rounded-sm">
                        Agotado
                      </span>
                    )}
                  </div>

                  {/* Speed effect on hover */}
                  <div className="absolute inset-0 bg-linear-to-r from-(--velocity-accent)/0 via-(--velocity-accent)/10 to-(--velocity-accent)/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="absolute bottom-0 right-0 left-0 h-1/2 bg-linear-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-6">
                    <span className="text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                      Ver Detalles{" "}
                      <ChevronRight
                        size={14}
                        className="text-(--velocity-accent)"
                      />
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 md:p-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-base md:text-xl font-bold uppercase italic tracking-tight line-clamp-2">
                      {product.name}
                    </h3>
                  </div>

                  {/* Categories as Specs Tags */}
                  {catalog.showFilters &&
                    product.categories &&
                    product.categories.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {product.categories.slice(0, 3).map((cat) => (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              toggleCategory(cat.id);
                            }}
                            className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded-sm uppercase tracking-wide hover:bg-slate-900 hover:text-white transition-colors"
                          >
                            {cat.name}
                          </button>
                        ))}
                      </div>
                    )}

                  <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div className="text-xl md:text-2xl font-black text-(--velocity-accent) tracking-tight">
                      {formatPrice(product.price, product.currency)}
                    </div>
                    <button className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-(--velocity-accent) transition-colors group-hover:scale-110">
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
        </div>

        {(!filteredProducts || filteredProducts.length === 0) && (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400">
            <Gauge size={64} strokeWidth={1} className="mb-4 text-slate-300" />
            <h3 className="text-2xl font-bold uppercase tracking-wide mb-2">
              No se encontraron productos
            </h3>
            <p className="mb-8">Intenta ajustar tus criterios de búsqueda.</p>
            <button onClick={resetFilters} className="velocity-btn px-6 py-3">
              Limpiar Filtros
            </button>
          </div>
        )}
      </main>

      {/* Shared Footer */}
      <div id="footer">
        {catalog.showPurchaseInfo && (
          <StorePurchaseInfo
            store={store}
            showPaymentButton={catalog.showPaymentButton}
            wrapperClassName="max-w-[1600px] mx-auto px-4 md:px-8 pb-12"
          />
        )}
        <StoreFooter
          store={store}
          config={{
            bg: "bg-slate-900",
            text: "text-white",
            muted: "text-slate-400",
            border: "border-slate-800",
            accent: "text-(--velocity-accent)",
          }}
        />
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 z-60 w-[85%] bg-white p-6 pt-24 shadow-2xl overflow-y-auto md:hidden"
            >
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="absolute top-8 right-8 p-2 text-slate-900 border border-slate-200 rounded-full"
              >
                <X size={24} />
              </button>

              <div className="space-y-10">
                {(catalog.showSearch || catalog.showFilters) && (
                  <CatalogControls
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    activeCategoryIds={activeCategoryIds}
                    onToggleCategory={toggleCategory}
                    minPrice={minPrice}
                    maxPrice={maxPrice}
                    onMinPriceChange={setMinPrice}
                    onMaxPriceChange={setMaxPrice}
                    priceBounds={priceBounds}
                    sortOrder={sortOrder}
                    setSortOrder={setSortOrder}
                    categories={categories}
                    tone="light"
                    onReset={resetFilters}
                    showSearch={catalog.showSearch}
                    showFilters={catalog.showFilters}
                    showSort={catalog.showSort}
                    showPrice={catalog.showFilters}
                    showCategories={catalog.showFilters}
                  />
                )}

                {store?.paymentLink && catalog.showPaymentButton && (
                  <a
                    href={store.paymentLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-4 bg-(--velocity-accent) text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg whitespace-nowrap"
                  >
                    <ExternalLink size={18} /> Ir al pago
                  </a>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          store={store}
          showShareButton={catalog.showShareButton}
          showPaymentButton={catalog.showPaymentButton}
        />
      )}
    </div>
  );
}
