import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  X,
  Leaf,
  Wind,
  Flower2,
  Trees,
  Cloud,
  ChevronRight,
  Filter,
  ArrowRight,
  ExternalLink,
  Share2,
  MessageCircle,
  ShoppingBag,
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
  return map[fontId] || "'Merriweather', serif";
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

// Floating particle component
const FloatingLeaf = ({ delay, duration, startX, size }) => (
  <motion.div
    className="absolute pointer-events-none text-green-600/20"
    initial={{ y: -20, x: startX, rotate: 0, opacity: 0 }}
    animate={{
      y: "100vh",
      x: [startX, startX + 50, startX - 30, startX + 20],
      rotate: [0, 45, -30, 60, 0],
      opacity: [0, 0.6, 0.6, 0],
    }}
    transition={{
      duration,
      delay,
      repeat: Infinity,
      ease: "linear",
    }}
  >
    <Leaf size={size} />
  </motion.div>
);

export function NatureTemplate({ store, products, isPreview = false }) {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  // Scroll tracking for parallax
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

  // ImageViewer State
  const [viewer, setViewer] = useState({
    isOpen: false,
    images: [],
    index: 0,
  });

  return (
    <div
      className="min-h-screen flex flex-col bg-(--nature-secondary) text-[#2d2a26] selection:bg-green-100 pt-[calc(var(--store-navbar-height)+var(--store-navbar-offset)+env(safe-area-inset-top))]"
      style={{
        fontFamily,
        colorScheme: "light",
        "--nature-primary": primary,
        "--nature-secondary": secondary,
        "--store-navbar-height": "4rem",
        "--store-navbar-offset": isPreview ? "2.5rem" : "0rem",
      }}
    >
      <style>{`
        @keyframes float {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(2deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        @keyframes sway {
          0%, 100% { transform: translateX(0) rotate(0deg); }
          25% { transform: translateX(5px) rotate(1deg); }
          75% { transform: translateX(-5px) rotate(-1deg); }
        }
        @keyframes breathe {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.05); opacity: 0.5; }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-sway { animation: sway 8s ease-in-out infinite; }
        .animate-breathe { animation: breathe 4s ease-in-out infinite; }
        .organic-shape { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
        .organic-bottom { border-bottom-left-radius: 40px; border-bottom-right-radius: 40px; }
        .nature-card {
          transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .nature-card:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 20px 40px -10px rgba(var(--nature-primary-rgb), 0.2);
        }
      `}</style>

      {/* Floating Leaves Particles */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <FloatingLeaf delay={0} duration={15} startX={100} size={16} />
        <FloatingLeaf delay={3} duration={18} startX={300} size={12} />
        <FloatingLeaf delay={6} duration={20} startX={500} size={18} />
        <FloatingLeaf delay={9} duration={16} startX={700} size={14} />
        <FloatingLeaf delay={2} duration={22} startX={900} size={16} />
        <FloatingLeaf delay={5} duration={17} startX={1100} size={12} />
      </div>

      {/* Store Navbar - Fixed & Glassmorphic */}
      <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
        <StoreNavbar
          store={store}
          isPreview={isPreview}
          config={{
            bg: "bg-white/70",
            text: "text-[#2d2a26]",
            border: "border-transparent",
            accent: "text-(--nature-primary)",
            glass: true,
          }}
          search={
            catalog.showSearch
              ? {
                  query: searchQuery,
                  onQueryChange: setSearchQuery,
                  variant: "minimal", // Or 'pill' if available
                }
              : null
          }
          onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="backdrop-blur-md shadow-sm"
          actions={
            catalog.showCart && (
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 text-[#1a2e1a] hover:text-(--nature-primary) transition-colors flex items-center justify-center"
                title="Carrito"
              >
                <ShoppingBag size={20} />
                {cart.length > 0 && (
                  <span className="absolute top-0 right-0 bg-(--nature-primary) text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-white shadow-sm">
                    {cart.length}
                  </span>
                )}
              </button>
            )
          }
        />
      </nav>

      {/* Hero Section */}
      <header className="relative pt-32 pb-24 px-6 overflow-hidden bg-white/40 organic-bottom mb-12">
        <div className="max-w-6xl mx-auto flex flex-col items-center text-center relative z-10">
          {/* Nature Icons Background - with parallax */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.06] flex justify-between items-center px-10"
            style={{ transform: `translateY(${scrollY * 0.15}px)` }}
          >
            <Trees className="w-80 h-80 text-(--nature-primary) -rotate-12 animate-sway" />
            <Cloud className="w-56 h-56 text-blue-900/20 translate-y-[-100px] animate-float" />
            <Wind
              className="w-48 h-48 text-(--nature-primary) rotate-12 animate-sway"
              style={{ animationDelay: "2s" }}
            />
          </div>

          {logoUrl ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="mb-8 p-2 bg-white organic-shape shadow-2xl shadow-green-900/10 overflow-hidden w-32 h-32 md:w-40 md:h-40 flex items-center justify-center relative z-20"
            >
              <img
                src={logoUrl}
                alt={store.name}
                className="w-full h-full object-cover rounded-full"
              />
            </motion.div>
          ) : (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="mb-8 p-8 bg-green-50 text-(--nature-primary) organic-shape animate-float shadow-xl shadow-green-900/10"
            >
              <Leaf size={64} strokeWidth={1.5} />
            </motion.div>
          )}

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-5xl md:text-7xl font-serif font-medium text-[#1a2e1a] mb-6 leading-tight tracking-tight relative z-20"
          >
            {store.name}
          </motion.h1>

          {store.description && (
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-lg md:text-xl text-[#4a554a] max-w-2xl mx-auto font-light leading-relaxed relative z-20"
            >
              {store.description}
            </motion.p>
          )}

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-12 flex flex-wrap justify-center gap-4 relative z-20"
          >
            <a
              href="#catalog"
              className="group px-10 py-4 bg-(--nature-primary) text-white rounded-full font-medium shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center gap-3 text-lg"
            >
              Explorar Catálogo{" "}
              <ArrowRight
                size={20}
                className="group-hover:translate-x-1 transition-transform"
              />
            </a>
          </motion.div>
        </div>

        {/* Decorative elements - with parallax */}
        <div
          className="absolute top-0 right-0 w-96 h-96 bg-green-200/40 organic-shape blur-[80px] -mr-32 -mt-32 animate-breathe"
          style={{ transform: `translateY(${scrollY * -0.2}px)` }}
        />
        <div
          className="absolute bottom-0 left-0 w-[30rem] h-[30rem] bg-orange-100/60 organic-shape blur-[80px] -ml-40 -mb-40 animate-breathe"
          style={{
            animationDelay: "2s",
            transform: `translateY(${scrollY * 0.1}px)`,
          }}
        />
      </header>

      {/* Main Content */}
      <main
        id="catalog"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full relative z-10"
      >
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-12">
          {/* Sidebar / Filters - "Greenhouse" Style */}
          {catalog.showFilters && (
            <aside className="hidden lg:block lg:w-80 shrink-0">
              <div className="sticky top-28 space-y-8">
                <div className="bg-white/60 backdrop-blur-md border border-white/50 rounded-[2rem] p-8 shadow-sm relative overflow-hidden">
                  {/* Decorative vine/leaf */}
                  <div className="absolute top-0 right-0 text-green-100 -mr-4 -mt-4 opacity-50 pointer-events-none">
                    <Leaf size={64} className="rotate-45" />
                  </div>

                  <div className="flex items-center justify-between mb-8 relative z-10">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-[#1a2e1a]/70 flex items-center gap-2">
                      <Filter size={16} /> Filtros
                    </h3>
                    <button
                      onClick={resetFilters}
                      className="text-[10px] font-bold uppercase tracking-widest text-(--nature-primary) hover:underline bg-white/50 px-2 py-1 rounded-full"
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
                    showFeaturedOnly={showFeaturedOnly}
                    onToggleFeaturedOnly={toggleFeaturedOnly}
                    hasFeaturedProducts={hasFeaturedProducts}
                  />
                </div>
              </div>
            </aside>
          )}

          {/* Product Grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-serif font-bold text-[#1a2e1a]">
                Productos
              </h2>
              {catalog.showProductCount && (
                <span className="text-sm text-[#4a554a] font-medium italic">
                  {filteredProducts?.length || 0} productos
                </span>
              )}
            </div>

            {filteredProducts && filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 md:gap-6">
                {filteredProducts.map((product, index) => {
                  const imageId = product.imageFileIds?.[0];
                  const imageUrl = imageId ? getProductImageUrl(imageId) : null;

                  return (
                    <motion.div
                      key={product.$id}
                      initial={{ opacity: 0, y: 40 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.7,
                        delay: index * 0.08,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      onClick={() => setSelectedProduct(product)}
                      className="group cursor-pointer nature-card bg-white rounded-[2rem] overflow-hidden border border-white shadow-sm hover:border-green-100/50"
                    >
                      <div className="aspect-4/5 overflow-hidden relative bg-[#f4f7f4]">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-[#f0fdf4]">
                            <Flower2 className="w-16 h-16 text-green-200" />
                          </div>
                        )}

                        {product.isFeatured && (
                          <div className="absolute top-4 left-4 z-10">
                            <span className="bg-stone-800/90 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest border border-white/20 shadow-lg flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>{" "}
                              Destacado
                            </span>
                          </div>
                        )}

                        {catalog.showShareButton && (
                          <div className="absolute right-4 top-4 flex flex-col gap-2 z-10 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                shareProduct(product);
                              }}
                              className="h-10 w-10 rounded-full bg-white/80 backdrop-blur-sm text-[#1a2e1a] flex items-center justify-center shadow-sm hover:bg-(--nature-primary) hover:text-white transition-colors"
                              aria-label="Compartir producto"
                            >
                              <Share2 size={18} />
                            </button>
                            {store.whatsapp && (
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
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
                                className="h-10 w-10 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-sm hover:bg-[#20bd5a] transition-colors"
                                aria-label="Pedir por WhatsApp"
                              >
                                <MessageCircle size={18} />
                              </button>
                            )}
                          </div>
                        )}

                        {/* Price Tag Overlay - Organic Pill */}
                        <div className="absolute bottom-4 left-4 right-4 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0 delay-75">
                          <span className="bg-white/95 backdrop-blur-md px-6 py-2 rounded-full text-base font-bold text-[#1a2e1a] shadow-lg border border-white/50">
                            {formatPrice(product.price, product.currency)}
                          </span>
                        </div>

                        {/* Quick View Overlay (Mobile mostly) */}
                        <div className="absolute inset-0 bg-green-900/0 group-hover:bg-green-900/5 transition-colors duration-500" />
                      </div>

                      <div className="p-6 text-center">
                        <h3 className="font-serif text-lg font-bold text-[#1a2e1a] mb-2 group-hover:text-(--nature-primary) transition-colors line-clamp-2 leading-tight">
                          {product.name}
                        </h3>
                        {catalog.showFilters &&
                          product.categories &&
                          product.categories.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3 justify-center">
                              {product.categories.slice(0, 1).map((cat) => (
                                <span
                                  key={cat.id}
                                  className="text-[10px] uppercase tracking-widest font-semibold px-3 py-1 rounded-full bg-[#f4f7f4] text-[#5d6b5d]"
                                >
                                  {cat.name}
                                </span>
                              ))}
                            </div>
                          )}
                        <div className="w-8 h-1 bg-(--nature-primary)/20 rounded-full mx-auto mt-4 group-hover:w-16 group-hover:bg-(--nature-primary) transition-all duration-300" />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-20 h-20 bg-green-50 organic-shape flex items-center justify-center mb-6">
                  <Wind className="w-8 h-8 text-green-200" />
                </div>
                <h3 className="text-xl font-serif font-bold text-[#1a2e1a]">
                  Sin productos
                </h3>
                <p className="text-[#4a554a] mt-2">
                  No hay productos que coincidan con tu búsqueda.
                </p>
                <button
                  onClick={resetFilters}
                  className="mt-8 text-sm font-bold text-(--nature-primary) hover:underline"
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
          showPaymentButton={catalog.showPaymentButton}
          wrapperClassName="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 w-full relative z-10"
        />
      )}
      <StoreFooter
        store={store}
        config={{
          bg: "bg-[#1a2e1a]",
          text: "text-green-100/60",
          border: "border-white/5",
          muted: "text-green-100/40",
          accent: "text-green-50",
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
              className="fixed inset-0 z-60 bg-black/40 backdrop-blur-sm md:hidden"
            />

            {/* Menu Sidebar */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 z-60 w-[85%] bg-[#fdfbf7] p-6 pt-24 shadow-2xl overflow-y-auto md:hidden"
            >
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="absolute top-8 right-8 p-2 bg-white organic-shape shadow-lg text-[#1a2e1a]"
              >
                <X size={24} />
              </button>

              <div className="space-y-12">
                {(catalog.showSearch || catalog.showFilters) && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-green-100 pb-2">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-[#15803d]/40">
                        Búsqueda y Filtros
                      </h3>
                      <button
                        onClick={resetFilters}
                        className="text-[10px] font-bold uppercase tracking-widest text-(--nature-primary)"
                      >
                        Reiniciar
                      </button>
                    </div>
                    {catalog.showSearch && (
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#15803d]/40" />
                        <input
                          type="search"
                          value={searchQuery}
                          onChange={(event) =>
                            setSearchQuery(event.target.value)
                          }
                          placeholder="Buscar..."
                          className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none border border-green-100 bg-white/70 text-[#1a2e1a] placeholder:text-[#15803d]/40"
                        />
                      </div>
                    )}
                    {catalog.showFilters && (
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
                        showFeaturedOnly={showFeaturedOnly}
                        onToggleFeaturedOnly={toggleFeaturedOnly}
                        hasFeaturedProducts={hasFeaturedProducts}
                      />
                    )}
                  </div>
                )}

                {store?.paymentLink && catalog.showPaymentButton && (
                  <div className="pt-8 border-t border-green-100">
                    <a
                      href={store.paymentLink}
                      target="_blank"
                      className="w-full py-4 bg-[#15803d] text-white rounded-full font-bold flex items-center justify-center gap-2 shadow-lg shadow-green-900/20 whitespace-nowrap"
                    >
                      <ExternalLink size={20} /> Comprar Ahora
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
        tone="nature"
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
        />
      )}
      <WhatsAppFloatingButton phoneNumber={store.whatsapp} />
    </div>
  );
}
