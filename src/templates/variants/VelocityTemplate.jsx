import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  ChevronRight,
  Gauge,
  ExternalLink,
  Share2,
  MessageCircle,
  Zap,
  Activity,
  Trophy,
} from "lucide-react";
import {
  CatalogControls,
  ProductDetailModal,
  StoreNavbar,
  StoreFooter,
  StorePurchaseInfo,
  shareProduct,
  CartDrawer,
  WhatsAppFloatingButton,
} from "../components";
import { getStoreLogoUrl } from "@/shared/services/storeService";
import { getProductImageUrl } from "@/shared/services/productService";
import { resolveThemeSettings } from "@/templates/registry";
import { resolveCatalogSettings } from "@/shared/utils/storeSettings";
import {
  useCatalogFilters,
  useShoppingCart,
  useProductDeepLink,
} from "../components/catalogHooks";

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

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
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
      className="min-h-screen text-slate-900 selection:bg-[var(--velocity-primary)] selection:text-white pt-[calc(var(--store-navbar-height)+var(--store-navbar-offset)+env(safe-area-inset-top))]"
      style={{
        backgroundColor: secondaryColor,
        fontFamily,
        colorScheme: "light",
        "--velocity-primary": primaryColor,
        "--velocity-secondary": secondaryColor,
        "--store-navbar-height": "4rem",
        "--store-navbar-offset": isPreview ? "2.5rem" : "0rem",
        "--color-border": "#e2e8f0",
        "--color-bg-secondary": "#f1f5f9",
        "--color-fg": "#0f172a",
        "--color-fg-secondary": "#334155",
        "--color-primary": "#dc2626",
        "--color-card": "#ffffff",
      }}
    >
      <style>{`
        .velocity-skew {
          transform: skewX(-12deg);
        }
        .velocity-unskew {
          transform: skewX(12deg);
        }
        .velocity-text-outline {
          -webkit-text-stroke: 1px rgba(0,0,0,0.1);
          color: transparent;
        }
        .bg-grid-pattern {
          background-image: linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px),
                           linear-gradient(to bottom, rgba(0,0,0,0.05) 1px, transparent 1px);
          background-size: 40px 40px;
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
      `}</style>

      {/* Dynamic Background Pattern */}
      <div className="fixed inset-0 bg-grid-pattern pointer-events-none z-0" />
      <div className="fixed top-0 right-0 w-[50vh] h-[100vh] bg-[var(--velocity-primary)] opacity-5 transform skew-x-[-12deg] translate-x-1/2 z-0" />

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
          bg: scrolled ? "bg-white/90 backdrop-blur-md" : "bg-transparent",
          text: "text-slate-900",
          border: "border-slate-200",
          accent: "text-[var(--velocity-primary)]",
          glass: false,
        }}
        actions={
          catalog.showCart && (
            <button
              onClick={() => setIsCartOpen(true)}
              className="hidden md:flex items-center gap-1 font-black italic uppercase tracking-tighter hover:text-[var(--velocity-primary)] transition-colors"
            >
              CART
              {cart.length > 0 && (
                <span className="ml-1 bg-[var(--velocity-primary)] text-white text-[10px] px-1.5 py-0.5 velocity-skew">
                  <span className="block velocity-unskew">{cart.length}</span>
                </span>
              )}
            </button>
          )
        }
      />

      {/* Hero Section */}
      <header className="relative pt-10 pb-20 overflow-hidden">
        <div className="absolute top-10 left-[-10%] w-[120%] h-full bg-gradient-to-r from-transparent via-[var(--velocity-primary)]/5 to-transparent transform -skew-x-12 pointer-events-none" />

        {/* Restored Speed Lines */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-400/30 to-transparent speed-line speed-line-1" />
          <div className="absolute top-1/3 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[var(--velocity-primary)]/40 to-transparent speed-line speed-line-2" />
          <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-400/20 to-transparent speed-line speed-line-3" />
          <div className="absolute top-2/3 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[var(--velocity-primary)]/30 to-transparent speed-line speed-line-4" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 text-center md:text-left space-y-6">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                <div className="inline-block bg-black text-white text-xs font-black italic uppercase tracking-widest px-4 py-1 mb-4 velocity-skew">
                  <span className="block velocity-unskew">
                    Alto Rendimiento
                  </span>
                </div>
                <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter leading-[0.9] text-slate-900 mb-4">
                  {store.name}
                </h1>
                {store.description && (
                  <p className="text-lg md:text-xl text-slate-600 font-medium max-w-lg mx-auto md:mx-0 border-l-4 border-[var(--velocity-primary)] pl-4">
                    {store.description}
                  </p>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="flex flex-wrap justify-center md:justify-start gap-4"
              >
                <a
                  href="#catalog"
                  className="group relative px-8 py-4 bg-[var(--velocity-primary)] text-white font-black italic uppercase tracking-wider overflow-hidden velocity-skew hover:brightness-110 transition-all"
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  <span className="relative flex items-center gap-2 velocity-unskew">
                    Comenzar <ChevronRight size={20} />
                  </span>
                </a>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9, x: 50 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.7 }}
              className="flex-1 w-full max-w-lg"
            >
              <div className="relative aspect-square md:aspect-[4/3]">
                <div className="absolute inset-0 bg-black velocity-skew translate-x-4 translate-y-4 opacity-10" />
                <div className="absolute inset-0 border-4 border-[var(--velocity-primary)] velocity-skew" />
                {store.logoFileId ? (
                  <div className="absolute inset-0 flex items-center justify-center p-12 velocity-skew overflow-hidden bg-white">
                    <img
                      src={getStoreLogoUrl(store.logoFileId)}
                      alt={store.name}
                      className="w-full h-full object-contain velocity-unskew transform hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-white velocity-skew">
                    <Gauge
                      size={120}
                      className="text-[var(--velocity-primary)] velocity-unskew opacity-20"
                      strokeWidth={1}
                    />
                    <div className="absolute inset-0 flex items-center justify-center velocity-unskew">
                      <h2 className="text-9xl font-black text-slate-100 velocity-text-outline pointer-events-none">
                        VELOCITY
                      </h2>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Stats / Features Banner */}
      <div className="bg-black text-white py-4 overflow-hidden -skew-y-2 mb-16">
        <div className="flex animate-marquee whitespace-nowrap gap-12 sm:gap-24 opacity-80 text-sm font-bold uppercase tracking-[0.2em] transform skew-x-[-12deg] justify-center items-center">
          <span className="flex items-center gap-2">
            <Trophy className="text-[var(--velocity-primary)]" size={16} />{" "}
            Calidad Premium
          </span>
          <span className="flex items-center gap-2">
            <Zap className="text-[var(--velocity-primary)]" size={16} /> Envío
            Rápido
          </span>
          <span className="flex items-center gap-2">
            <Activity className="text-[var(--velocity-primary)]" size={16} />{" "}
            Alto Rendimiento
          </span>
          <span className="flex items-center gap-2 text-[var(--velocity-primary)]">
            ///
          </span>
          <span className="flex items-center gap-2">
            <Trophy className="text-[var(--velocity-primary)]" size={16} />{" "}
            Calidad Premium
          </span>
          <span className="flex items-center gap-2">
            <Zap className="text-[var(--velocity-primary)]" size={16} /> Envío
            Rápido
          </span>
        </div>
      </div>

      <main
        id="catalog"
        className="max-w-[1600px] mx-auto px-4 md:px-8 pb-32 relative z-10"
      >
        {/* Controls Layout */}
        <div className="flex flex-col lg:flex-row gap-8 mb-12">
          {/* Sidebar Area - Desktop */}
          {catalog.showFilters && (
            <div className="hidden lg:block w-72 shrink-0 space-y-8">
              <div className="sticky top-24 z-20">
                {/* Added overflow-hidden to contain filters properly */}
                <div className="bg-white border-l-4 border-[var(--velocity-primary)] p-6 shadow-xl shadow-slate-200/50 overflow-hidden relative">
                  <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-2">
                    <h3 className="font-black italic uppercase tracking-tighter text-2xl">
                      Filtrar
                    </h3>
                    <button
                      onClick={resetFilters}
                      className="text-[10px] font-bold uppercase bg-slate-900 text-white px-2 py-1 hover:bg-[var(--velocity-primary)] transition-colors"
                    >
                      Reiniciar
                    </button>
                  </div>
                  <div className="relative z-10">
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
                      showSearch={false} // Shown in navbar
                      showFilters={true}
                      showSort={catalog.showSort}
                      showPrice={catalog.showFilters}
                      showCategories={catalog.showFilters}
                      showFeaturedOnly={showFeaturedOnly}
                      onToggleFeaturedOnly={toggleFeaturedOnly}
                      hasFeaturedProducts={hasFeaturedProducts}
                      variant="minimal"
                      orientation="vertical"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex-1 min-w-0">
            {" "}
            {/* min-w-0 prevents grid overflow */}
            {/* Mobile Controls */}
            <div className="lg:hidden mb-6 space-y-4">
              {catalog.showSearch && (
                <div className="relative">
                  <input
                    type="text"
                    placeholder="BUSCAR EN CATÁLOGO..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white border-2 border-slate-900 p-4 font-bold italic placeholder:text-slate-400 focus:outline-none focus:border-[var(--velocity-primary)]"
                  />
                </div>
              )}
              {catalog.showFilters && (
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  <button
                    onClick={() => setIsMobileMenuOpen(true)}
                    className="shrink-0 bg-black text-white px-6 py-3 font-bold italic uppercase flex items-center gap-2"
                  >
                    <Gauge size={18} /> Filtros
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => toggleCategory(cat.id)}
                      className={`shrink-0 px-6 py-3 font-bold italic uppercase border-2 ${activeCategoryIds.includes(cat.id) ? "bg-[var(--velocity-primary)] border-[var(--velocity-primary)] text-white" : "bg-white border-slate-200 text-slate-800"}`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {/* Header */}
            <div className="flex items-end justify-between mb-8 border-b-4 border-slate-900 pb-2">
              <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter break-words">
                Inventario{" "}
                <span className="text-[var(--velocity-primary)]">///</span>
              </h2>
              {catalog.showProductCount && (
                <span className="font-mono font-bold text-slate-400 whitespace-nowrap ml-4">
                  {filteredProducts?.length || 0} UNIDADES
                </span>
              )}
            </div>
            {/* Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-x-4 gap-y-12 md:gap-x-8 md:gap-y-16">
              {filteredProducts &&
                filteredProducts.map((product, idx) => (
                  <motion.div
                    key={product.$id}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05, duration: 0.4 }}
                    className="group relative"
                    onClick={() => setSelectedProduct(product)}
                  >
                    {/* Card Layout */}
                    <div className="relative cursor-pointer">
                      {/* Image Frame */}
                      <div className="relative aspect-[4/5] bg-slate-100 overflow-hidden velocity-skew border-r-4 border-b-4 border-transparent group-hover:border-[var(--velocity-primary)] transition-all duration-300">
                        {/* Product Image */}
                        <div className="absolute inset-0 velocity-unskew scale-110">
                          {product.imageFileIds?.[0] ? (
                            <img
                              src={getProductImageUrl(product.imageFileIds[0])}
                              alt={product.name}
                              className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 transform group-hover:scale-110"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-slate-200">
                              <Gauge size={48} className="text-slate-300" />
                            </div>
                          )}
                        </div>

                        {/* Selection Overlay */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center velocity-unskew">
                          <span className="text-white font-black italic text-2xl tracking-tighter uppercase px-4 py-2 border-2 border-[var(--velocity-primary)] bg-black/50 backdrop-blur-sm">
                            Ver Detalles
                          </span>
                        </div>

                        {/* Badges */}
                        <div className="absolute top-4 left-0 velocity-unskew z-10 flex flex-col gap-2 items-start">
                          {product.stock > 0 ? (
                            <span className="bg-[var(--velocity-primary)] text-white text-xs font-black italic uppercase px-3 py-1 shadow-lg">
                              Disponible
                            </span>
                          ) : (
                            <span className="bg-slate-800 text-white text-xs font-black italic uppercase px-3 py-1 shadow-lg">
                              Agotado
                            </span>
                          )}
                          {product.isFeatured && (
                            <span className="bg-yellow-400 text-black text-xs font-black italic uppercase px-3 py-1 shadow-lg border-2 border-black">
                              Destacado
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Info Block - Floats over bottom */}
                      <div className="mt-4 md:-mt-8 md:ml-4 relative z-10 bg-white p-4 shadow-xl border-l-4 border-slate-900 group-hover:border-[var(--velocity-primary)] transition-colors duration-300">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-bold italic uppercase leading-none text-slate-900 text-lg md:text-xl line-clamp-2 pr-2">
                            {product.name}
                          </h3>
                          <div className="shrink-0 bg-slate-100 px-2 py-1 font-mono font-bold text-sm text-[var(--velocity-primary)]">
                            {formatPrice(product.price, product.currency)}
                          </div>
                        </div>

                        {/* Specs/Categories */}
                        {catalog.showFilters &&
                          product.categories?.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {product.categories.slice(0, 2).map((cat) => (
                                <span
                                  key={cat.id}
                                  className="text-[10px] font-bold uppercase tracking-wider text-slate-400"
                                >
                                  #{cat.name}
                                </span>
                              ))}
                            </div>
                          )}

                        {catalog.showShareButton && (
                          <div className="absolute bottom-full right-0 mb-2 flex flex-col gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                shareProduct(product);
                              }}
                              className="w-8 h-8 bg-white border-2 border-slate-900 flex items-center justify-center hover:bg-[var(--velocity-primary)] hover:border-[var(--velocity-primary)] hover:text-white transition-colors shadow-lg"
                            >
                              <Share2 size={14} />
                            </button>
                            {store.whatsapp && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const number = store.whatsapp.replace(
                                    /\D/g,
                                    "",
                                  );
                                  const text = encodeURIComponent(
                                    `Hola! Me interesa este producto: ${product.name} ${formatPrice(product.price, product.currency)}`,
                                  );
                                  window.open(
                                    `https://wa.me/${number}?text=${text}`,
                                    "_blank",
                                  );
                                }}
                                className="w-8 h-8 bg-[#25D366] border-2 border-slate-900 flex items-center justify-center hover:bg-[#20bd5a] hover:border-[#20bd5a] text-white transition-colors shadow-lg"
                              >
                                <MessageCircle size={14} />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
            </div>
            {/* Empty State */}
            {(!filteredProducts || filteredProducts.length === 0) && (
              <div className="py-24 text-center border-4 border-dashed border-slate-200">
                <h3 className="text-3xl font-black italic text-slate-300 mb-4">
                  SIN SEÑAL
                </h3>
                <button
                  onClick={resetFilters}
                  className="bg-black text-white px-8 py-3 font-bold italic uppercase hover:bg-[var(--velocity-primary)] transition-colors"
                >
                  Reiniciar Sistemas
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <div className="relative z-10 bg-white border-t-8 border-slate-900 pt-16">
        {catalog.showPurchaseInfo && (
          <div className="max-w-7xl mx-auto px-6 mb-12">
            <StorePurchaseInfo
              store={store}
              showPaymentButton={catalog.showPaymentButton}
              wrapperClassName="bg-slate-50 border border-slate-200 p-8 md:p-12 relative overflow-hidden"
            />
          </div>
        )}
        <StoreFooter
          store={store}
          config={{
            bg: "bg-black",
            text: "text-white",
            muted: "text-slate-500",
            border: "border-slate-800",
            accent: "text-[var(--velocity-primary)]",
          }}
        />
      </div>

      {/* Mobile Side Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed left-0 right-0 bottom-0 z-50 bg-black/90 backdrop-blur-sm md:hidden"
              style={{ top: "var(--store-navbar-offset)" }}
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed right-0 bottom-0 z-50 w-[85%] bg-white p-6 pt-24 shadow-2xl overflow-y-auto md:hidden"
              style={{ top: "var(--store-navbar-offset)" }}
            >
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="absolute top-6 right-6 p-2 bg-slate-100 rounded-full"
              >
                <X size={24} />
              </button>

              <div className="space-y-12">
                <div className="border-l-4 border-[var(--velocity-primary)] pl-6">
                  <h2 className="text-4xl font-black italic tracking-tighter mb-2">
                    FILTROS
                  </h2>
                  <p className="text-slate-500 font-bold uppercase text-xs tracking-widest">
                    Refina tu búsqueda
                  </p>
                </div>

                {catalog.showFilters && (
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
                    showSearch={catalog.showSearch}
                    showFilters={catalog.showFilters}
                    showSort={catalog.showSort}
                    showPrice={catalog.showFilters}
                    showCategories={catalog.showFilters}
                    showFeaturedOnly={showFeaturedOnly}
                    onToggleFeaturedOnly={toggleFeaturedOnly}
                    hasFeaturedProducts={hasFeaturedProducts}
                    onReset={resetFilters}
                  />
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          store={store}
          showShareButton={catalog.showShareButton}
          showPaymentButton={catalog.showPaymentButton}
          onAddToCart={addToCart}
        />
      )}

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
          tone="light"
        />
      )}
      <WhatsAppFloatingButton phoneNumber={store.whatsapp} />
    </div>
  );
}
