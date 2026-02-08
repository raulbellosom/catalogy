import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  X,
  Layers,
  ChevronRight,
  ArrowRight,
  ExternalLink,
  Share2,
  MessageCircle,
  Sparkles,
  Hexagon,
  Globe,
} from "lucide-react";
import { getStoreLogoUrl } from "@/shared/services/storeService";
import { getProductImageUrl } from "@/shared/services/productService";
import {
  ProductDetailModal,
  StoreNavbar,
  StoreFooter,
  CatalogControls,
  StorePurchaseInfo,
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

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const theme = resolveThemeSettings(store);
  const catalog = resolveCatalogSettings(store);
  const fontFamily = resolveFontFamily(theme.font);
  const primary = theme.colors.primary;
  const secondary = theme.colors.secondary; // Will be background
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

  const [viewer, setViewer] = useState({
    isOpen: false,
    images: [],
    index: 0,
  });

  return (
    <div
      className="min-h-screen flex flex-col pt-[calc(var(--store-navbar-height)+var(--store-navbar-offset)+env(safe-area-inset-top))]"
      style={{
        fontFamily,
        backgroundColor: secondary || "#0a0a0a",
        color: "#ffffff",
        colorScheme: "dark",
        "--prism-accent": primary,
        "--prism-bg": secondary || "#0a0a0a",
        "--prism-glass": "rgba(255, 255, 255, 0.05)",
        "--prism-glass-border": "rgba(255, 255, 255, 0.1)",
        "--store-navbar-height": "4rem",
        "--store-navbar-offset": isPreview ? "2.5rem" : "0rem",
      }}
    >
      <style>{`
        .glass-card {
          background: var(--prism-glass);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid var(--prism-glass-border);
          box-shadow: 0 4px 24px -1px rgba(0, 0, 0, 0.1);
        }
        .text-gradient {
            background: linear-gradient(135deg, #fff 30%, var(--prism-accent) 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        .iridescent-border {
            position: relative;
        }
        .iridescent-border::after {
            content: '';
            position: absolute;
            inset: -1px;
            background: linear-gradient(45deg, var(--prism-accent), transparent 60%, var(--prism-accent));
            z-index: -1;
            opacity: 0.3;
            border-radius: inherit;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>

      {/* Background Refractions */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-[var(--prism-accent)] opacity-[0.15] blur-[150px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-blue-500 opacity-[0.1] blur-[120px]" />
        <div className="absolute top-[40%] right-[20%] w-[20vw] h-[20vw] rounded-full bg-purple-500 opacity-[0.08] blur-[100px] animate-pulse" />
      </div>

      <StoreNavbar
        store={store}
        isPreview={isPreview}
        config={{
          bg: "bg-[var(--prism-bg)]/60 backdrop-blur-xl border-b border-white/5",
          text: "text-white",
          border: "border-white/5",
          accent: "text-[var(--prism-accent)]",
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
        onMobileMenuToggle={() => setMobileMenuOpen(true)}
        actions={
          catalog.showCart && (
            <button
              onClick={() => setIsCartOpen(true)}
              className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full glass-card hover:bg-white/10 transition-colors"
            >
              <span className="text-xs font-bold uppercase tracking-wider text-white">
                Carrito
              </span>
              {cart.length > 0 && (
                <span className="bg-[var(--prism-accent)] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {cart.length}
                </span>
              )}
            </button>
          )
        }
      />

      <header className="relative py-20 lg:py-32 px-4 overflow-hidden -mt-[4rem]">
        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center text-center">
          {/* Logo/Icon Container */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0, rotateX: 20 }}
            animate={{ scale: 1, opacity: 1, rotateX: 0 }}
            transition={{ duration: 0.8, type: "spring" }}
            className="mb-10 relative"
          >
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl glass-card flex items-center justify-center relative z-10 overflow-hidden animate-float">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={store.name}
                  className="w-full h-full object-contain p-4"
                />
              ) : (
                <Hexagon
                  size={64}
                  className="text-[var(--prism-accent)] drop-shadow-[0_0_15px_var(--prism-accent)]"
                  strokeWidth={1}
                />
              )}
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent skew-x-12 translate-x-[-150%] animate-[shimmer_3s_infinite]" />
            </div>
            {/* Reflection */}
            <div
              className="absolute -bottom-8 left-0 right-0 h-8 opacity-30 transform scale-y-[-1] mask-image-gradient-to-b"
              style={{
                background:
                  "linear-gradient(to bottom, rgba(255,255,255,0.1), transparent)",
              }}
            ></div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-7xl font-bold tracking-tight mb-6 text-gradient"
          >
            {store.name}
          </motion.h1>

          {store.description && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg text-white/50 max-w-2xl font-light leading-relaxed mb-10"
            >
              {store.description}
            </motion.p>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex gap-4"
          >
            <a
              href="#catalog"
              className="px-8 py-3 rounded-full bg-[var(--prism-accent)] text-white font-medium hover:brightness-110 transition-all shadow-[0_0_30px_-10px_var(--prism-accent)] flex items-center gap-2"
            >
              Explorar Colección <ArrowRight size={18} />
            </a>
          </motion.div>
        </div>
      </header>

      <main
        id="catalog"
        className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 pb-32 w-full"
      >
        {/* Glass Control Bar */}
        {(catalog.showFilters || catalog.showSearch) && (
          <div className="sticky top-24 z-30 mb-12 hidden lg:block">
            <div className="glass-card rounded-2xl p-4 flex items-center gap-6">
              <div className="text-sm font-bold tracking-widest text-white/40 uppercase pl-2 flex items-center gap-2">
                <Sparkles size={14} /> Filtrar
              </div>
              <div className="h-8 w-px bg-white/10" />
              <div className="flex-1">
                <CatalogControls
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  activeCategoryIds={activeCategoryIds}
                  onToggleCategory={toggleCategory}
                  categories={categories}
                  minPrice={minPrice}
                  maxPrice={maxPrice}
                  onMinPriceChange={setMinPrice}
                  onMaxPriceChange={setMaxPrice}
                  priceBounds={priceBounds}
                  sortOrder={sortOrder}
                  setSortOrder={setSortOrder}
                  onReset={resetFilters}
                  showSearch={catalog.showSearch}
                  showFilters={catalog.showFilters}
                  showSort={catalog.showSort}
                  showPrice={catalog.showFilters}
                  showCategories={catalog.showFilters}
                  variant="minimal"
                  tone="dark"
                />
              </div>
            </div>
          </div>
        )}

        {/* Mobile Filter Toggle */}
        <div className="lg:hidden mb-8 flex justify-between items-end">
          <h2 className="text-3xl font-bold text-white">Productos</h2>
          {catalog.showFilters && (
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="px-4 py-2 glass-card rounded-full text-sm font-bold text-[var(--prism-accent)] flex items-center gap-2"
            >
              Filtros
            </button>
          )}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts &&
            filteredProducts.map((product, idx) => {
              const imageId = product.imageFileIds?.[0];
              const imageUrl = imageId ? getProductImageUrl(imageId) : null;

              return (
                <motion.div
                  key={product.$id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05, duration: 0.5 }}
                  onClick={() => setSelectedProduct(product)}
                  className="group cursor-pointer"
                >
                  <div className="glass-card rounded-2xl overflow-hidden iridescent-border transition-all duration-300 hover:transform hover:-translate-y-2 hover:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)]">
                    {/* Image */}
                    <div className="aspect-[3/4] relative overflow-hidden bg-black/40">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Layers size={32} className="text-white/20" />
                        </div>
                      )}

                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />

                      {catalog.showShareButton && (
                        <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              shareProduct(product);
                            }}
                            className="p-2 rounded-full bg-black/40 backdrop-blur-md text-white border border-white/10 hover:bg-[var(--prism-accent)] transition-colors"
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
                              className="p-2 rounded-full bg-[#25D366]/40 backdrop-blur-md text-white border border-white/10 hover:bg-[#25D366] transition-colors"
                            >
                              <MessageCircle size={14} />
                            </button>
                          )}
                        </div>
                      )}

                      {/* Price Badge */}
                      <div className="absolute bottom-4 left-4">
                        <span className="text-lg font-bold text-white tracking-tight drop-shadow-md">
                          {formatPrice(product.price, product.currency)}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      {/* Categories */}
                      {catalog.showFilters &&
                        product.categories?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {product.categories.slice(0, 2).map((cat) => (
                              <span
                                key={cat.id}
                                className="text-[10px] font-bold uppercase tracking-wider text-[var(--prism-accent)] opacity-80"
                              >
                                {cat.name}
                              </span>
                            ))}
                          </div>
                        )}

                      <h3 className="text-base font-medium text-white/90 line-clamp-2 mb-4 group-hover:text-white transition-colors">
                        {product.name}
                      </h3>

                      <div className="flex items-center justify-between pt-4 border-t border-white/5">
                        <span className="text-xs font-bold text-white/40 uppercase tracking-widest group-hover:text-[var(--prism-accent)] transition-colors">
                          Ver Detalles
                        </span>
                        <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[var(--prism-accent)] group-hover:text-white transition-all">
                          <ChevronRight size={14} />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
        </div>

        {/* Empty State */}
        {(!filteredProducts || filteredProducts.length === 0) && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 glass-card rounded-full flex items-center justify-center mb-6 animate-pulse">
              <Search className="text-white/30" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              No se encontraron resultados
            </h3>
            <p className="text-white/40 mb-6">
              Intenta ajustar tus filtros o criterios de búsqueda.
            </p>
            <button
              onClick={resetFilters}
              className="px-6 py-2 rounded-full border border-white/20 text-white hover:bg-white hover:text-black transition-colors text-sm font-medium"
            >
              Limpiar Filtros
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <div className="border-t border-white/5 bg-black/20 backdrop-blur-lg">
        {catalog.showPurchaseInfo && (
          <div className="max-w-7xl mx-auto px-6 py-10">
            <StorePurchaseInfo
              store={store}
              showPaymentButton={catalog.showPaymentButton}
              tone="dark"
              wrapperClassName="glass-card rounded-2xl p-8"
            />
          </div>
        )}
        <StoreFooter
          store={store}
          config={{
            bg: "bg-transparent",
            text: "text-white/60",
            border: "border-white/5",
            accent: "text-[var(--prism-accent)]",
            glass: false,
          }}
        />
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md lg:hidden"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 right-0 z-50 w-[85%] bg-[#0f0f0f] border-l border-white/10 p-4 pt-24 shadow-2xl overflow-y-auto lg:hidden"
            >
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="absolute top-6 right-6 p-2 rounded-full glass-card text-white"
              >
                <X size={24} />
              </button>

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
                  tone="dark" // Using dark/noir tone
                  showSearch={catalog.showSearch}
                  showFilters={true}
                  showSort={catalog.showSort}
                  showPrice={catalog.showFilters}
                  showCategories={catalog.showFilters}
                  showFeaturedOnly={showFeaturedOnly}
                  onToggleFeaturedOnly={toggleFeaturedOnly}
                  hasFeaturedProducts={hasFeaturedProducts}
                  onReset={resetFilters}
                  layout="vertical"
                />
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <ImageViewerModal
        isOpen={viewer.isOpen}
        onClose={() => setViewer((v) => ({ ...v, isOpen: false }))}
        images={viewer.images}
        initialIndex={viewer.index}
      />

      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          store={store}
          tone="dark"
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
          tone="dark"
        />
      )}
      <WhatsAppFloatingButton phoneNumber={store.whatsapp} />
    </div>
  );
}
