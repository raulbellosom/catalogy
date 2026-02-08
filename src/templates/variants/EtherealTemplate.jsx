import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView } from "motion/react";
import {
  X,
  ArrowRight,
  Search,
  ExternalLink,
  Menu,
  SlidersHorizontal,
  Share2,
  MessageCircle,
} from "lucide-react";
import {
  StoreNavbar,
  StoreFooter,
  CatalogControls,
  ProductDetailModal,
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
  return map[fontId] || "'Playfair Display', serif";
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

export function EtherealTemplate({ store, products, isPreview = false }) {
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
  const [isFilterOpen, setIsFilterOpen] = useState(false);
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
  const fontFamily = resolveFontFamily(theme.font || "playfair");

  return (
    <div
      className="min-h-screen text-stone-900 selection:bg-stone-200 selection:text-black"
      style={{
        backgroundColor: secondaryColor || "#fafaf9", // Stone-50 fallback
        fontFamily,
        colorScheme: "light",
        "--ethereal-accent": primaryColor,
        "--store-navbar-offset": isPreview ? "2.5rem" : "0rem",
      }}
    >
      <style>{`
        .ethereal-serif {
          font-family: 'Playfair Display', serif;
        }
        .ethereal-sans {
          font-family: 'Inter', sans-serif;
        }
        .image-reveal {
          clip-path: inset(0 0 0 0);
          transition: clip-path 0.8s cubic-bezier(0.65, 0, 0.35, 1);
        }
        .group:hover .image-reveal {
          clip-path: inset(2% 2% 2% 2%);
        }
        .noise-bg {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            pointer-events: none;
            z-index: 50;
            opacity: 0.03;
            background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
        }
      `}</style>

      {/* Noise Overlay for texture */}
      <div className="noise-bg" />

      {/* Navbar - Minimal & Centered */}
      <nav
        className={`fixed left-0 right-0 z-40 transition-all duration-500 ${
          scrolled
            ? "bg-white/80 backdrop-blur-md border-b border-stone-100 py-4"
            : "bg-transparent py-6"
        }`}
        style={{ top: "var(--store-navbar-offset, 0px)" }}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          {/* Mobile Menu Trigger */}
          <button
            className="lg:hidden p-2 -ml-2 hover:bg-black/5 rounded-full transition-colors"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Menu"
          >
            <Menu size={24} strokeWidth={1} />
          </button>

          {/* Brand */}
          <div className="text-xl md:text-2xl font-medium tracking-tight mx-auto lg:mx-0">
            {store.logoFileId ? (
              <img
                src={getStoreLogoUrl(store.logoFileId)}
                alt={store.name}
                className="h-10 w-auto object-contain"
              />
            ) : (
              <span className="font-serif italic">{store.name}</span>
            )}
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-8 text-sm font-medium tracking-wide uppercase">
            <a
              href="#catalog"
              className="hover:text-[var(--ethereal-accent)] transition-colors"
            >
              Colección
            </a>
            <a
              href="#about"
              className="hover:text-[var(--ethereal-accent)] transition-colors"
            >
              Nosotros
            </a>
            {catalog.showSearch && (
              <button
                className="hover:text-[var(--ethereal-accent)] transition-colors"
                aria-label="Search"
                onClick={() => setIsFilterOpen(true)}
              >
                <Search size={18} strokeWidth={1.5} />
              </button>
            )}

            {catalog.showCart && (
              <button
                onClick={() => setIsCartOpen(true)}
                className="hover:text-[var(--ethereal-accent)] transition-colors relative"
                aria-label="Cart"
              >
                <span className="text-sm font-medium tracking-wide uppercase">
                  CARRITO
                </span>
                {cart.length > 0 && (
                  <span className="absolute -top-2 -right-3 bg-[var(--ethereal-accent)] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                    {cart.length}
                  </span>
                )}
              </button>
            )}
          </div>

          <div className="lg:hidden flex gap-4">
            {catalog.showCart && (
              <button onClick={() => setIsCartOpen(true)} className="relative">
                {/* Use a simple text or bag icon for mobile */}
                <span className="text-sm font-serif italic">
                  Bag ({cart.length})
                </span>
              </button>
            )}
            <button onClick={() => setIsMobileMenuOpen(true)}>
              <Search size={20} strokeWidth={1} />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section - Editorial Style */}
      <header className="pt-32 pb-20 px-6 md:px-12 lg:px-24">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center text-center space-y-8"
          >
            <span className="text-xs font-medium tracking-[0.2em] uppercase text-stone-500">
              {store.name?.toUpperCase()}
            </span>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif italic font-light tracking-tight leading-[1.1]">
              {store.name}
            </h1>

            {store.description && (
              <p className="max-w-lg text-lg text-stone-600 font-light leading-relaxed">
                {store.description}
              </p>
            )}

            {/* Removed empty Editorial placeholder */}
          </motion.div>
        </div>
      </header>

      {/* Catalog Section */}
      <main id="catalog" className="max-w-7xl mx-auto px-6 pb-32">
        {/* Filters Header (Sticky) */}
        <div className="sticky top-0 z-30 bg-[color:var(--ethereal-secondary,var(--bg-color,#fafaf9))] pt-4 pb-8 border-b border-stone-200 mb-12 bg-opacity-95 backdrop-blur-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-baseline gap-4">
              <h2 className="text-2xl font-serif italic">Catálogo</h2>
              <span className="text-xs text-stone-400 font-mono">
                ({filteredProducts?.length} ARTÍCULOS)
              </span>
            </div>

            <div className="flex items-center gap-4">
              {/* Desktop Filter Trigger */}
              <button
                onClick={() => setIsFilterOpen(true)}
                className="hidden lg:flex items-center gap-2 text-sm uppercase tracking-wider border border-stone-300 px-4 py-2 hover:bg-white transition-colors"
              >
                <SlidersHorizontal size={14} /> Filtros
              </button>

              {/* Mobile Filter Trigger */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden flex items-center gap-2 text-sm uppercase tracking-wider border border-stone-300 px-4 py-2 hover:bg-white transition-colors"
              >
                <SlidersHorizontal size={14} /> Filtros
              </button>
            </div>
          </div>
        </div>

        {/* Product Grid - Minimalist */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 md:gap-x-8 gap-y-12 md:gap-y-16">
          {filteredProducts &&
            filteredProducts.map((product, idx) => (
              <motion.div
                key={product.$id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05, duration: 0.6 }}
                className="group cursor-pointer"
                onClick={() => setSelectedProduct(product)}
              >
                <div className="aspect-[3/4] overflow-hidden bg-stone-100 relative mb-4">
                  {product.imageFileIds?.[0] ? (
                    <img
                      src={getProductImageUrl(product.imageFileIds[0])}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-300">
                      <span className="font-serif italic text-2xl">Imagen</span>
                    </div>
                  )}

                  {/* Featured Badge (Moved to Left) */}
                  {product.isFeatured && (
                    <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 z-10">
                      <span className="text-[10px] uppercase tracking-widest font-medium text-black">
                        Destacado
                      </span>
                    </div>
                  )}

                  {/* Actions (Top Right) */}
                  <div className="absolute top-2 right-2 flex flex-col gap-2 z-10">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        shareProduct(product);
                      }}
                      className="w-8 h-8 flex items-center justify-center bg-white/90 backdrop-blur-sm text-stone-600 hover:text-black hover:bg-white transition-colors"
                    >
                      <Share2 size={16} />
                    </button>
                    {store.whatsapp && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const number = store.whatsapp.replace(/\D/g, "");
                          const text = encodeURIComponent(
                            `Hola! Me interesa este producto: ${product.name} ${formatPrice(product.price, product.currency)}`,
                          );
                          window.open(
                            `https://wa.me/${number}?text=${text}`,
                            "_blank",
                          );
                        }}
                        className="w-8 h-8 flex items-center justify-center bg-[#25D366] text-white hover:bg-[#20bd5a] transition-colors"
                      >
                        <MessageCircle size={16} />
                      </button>
                    )}
                  </div>

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />

                  {/* Quick View Button */}
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform translate-y-2 group-hover:translate-y-0">
                    <button className="bg-white text-black px-6 py-2 text-xs uppercase tracking-widest hover:bg-black hover:text-white transition-colors shadow-xl">
                      Vista Rápida
                    </button>
                  </div>
                </div>

                <div className="text-center space-y-1">
                  <h3 className="text-sm md:text-base font-medium text-stone-900 group-hover:underline decoration-stone-300 underline-offset-4 transition-all">
                    {product.name}
                  </h3>
                  <p className="text-sm text-stone-500 font-serif italic">
                    {formatPrice(product.price, product.currency)}
                  </p>
                </div>
              </motion.div>
            ))}
        </div>

        {(!filteredProducts || filteredProducts.length === 0) && (
          <div className="py-32 text-center">
            <span className="block font-serif italic text-2xl text-stone-400 mb-4">
              Sin resultados
            </span>
            <button
              onClick={resetFilters}
              className="text-xs uppercase tracking-widest border-b border-black pb-1 hover:text-[var(--ethereal-accent)] hover:border-[var(--ethereal-accent)] transition-colors"
            >
              Limpiar Filtros
            </button>
          </div>
        )}
      </main>

      {/* Footer - Elegant */}
      <div className="bg-stone-100 pt-20 pb-10 px-6 border-t border-stone-200">
        <div className="max-w-7xl mx-auto">
          {catalog.showPurchaseInfo && (
            <div className="mb-10">
              <StorePurchaseInfo
                store={store}
                showPaymentButton={catalog.showPaymentButton}
                wrapperClassName="bg-white p-8 border border-stone-100"
              />
            </div>
          )}

          <StoreFooter
            store={store}
            config={{
              bg: "bg-transparent",
              text: "text-stone-600",
              muted: "text-stone-400",
              border: "border-transparent",
              accent: "text-black",
            }}
          />
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-50 w-[80%] max-w-sm bg-[#fafaf9] p-8 shadow-2xl overflow-y-auto"
              style={{ top: "var(--store-navbar-offset, 0px)" }}
            >
              <div className="flex justify-between items-center mb-12">
                <span className="font-serif italic text-xl">{store.name}</span>
                <button onClick={() => setIsMobileMenuOpen(false)}>
                  <X
                    size={24}
                    strokeWidth={1}
                    className="text-stone-400 hover:text-black"
                  />
                </button>
              </div>

              <div className="space-y-8">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-4">
                    Filtrar por Categoría
                  </h3>
                  <div className="space-y-3">
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => {
                          toggleCategory(cat.id);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`block text-lg font-serif italic ${activeCategoryIds.includes(cat.id) ? "text-black underline" : "text-stone-500 hover:text-black"}`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-4">
                    Ordenar
                  </h3>
                  {/* Simple sort options could go here */}
                  <div className="space-y-2 text-sm text-stone-600">
                    <button
                      onClick={() => setSortOrder("newest")}
                      className="block hover:text-black"
                    >
                      Lo más nuevo
                    </button>
                    <button
                      onClick={() => setSortOrder("price-asc")}
                      className="block hover:text-black"
                    >
                      Precio: Menor a Mayor
                    </button>
                    <button
                      onClick={() => setSortOrder("price-desc")}
                      className="block hover:text-black"
                    >
                      Precio: Mayor a Menor
                    </button>
                  </div>
                </div>

                {hasFeaturedProducts && (
                  <div className="pt-4 border-t border-stone-100">
                    <button
                      onClick={() => {
                        toggleFeaturedOnly();
                      }}
                      className={`w-full py-3 text-xs uppercase tracking-widest border transition-colors ${
                        showFeaturedOnly
                          ? "bg-stone-900 text-white border-stone-900"
                          : "bg-white text-stone-500 border-stone-200 hover:border-stone-900 hover:text-stone-900"
                      }`}
                    >
                      {showFeaturedOnly ? "Ver Todos" : "Ver Solo Destacados"}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Filter Drawer (Desktop) */}
      <AnimatePresence>
        {isFilterOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm hidden lg:block"
              onClick={() => setIsFilterOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 right-0 z-50 w-[400px] bg-[#fafaf9] p-8 shadow-2xl overflow-y-auto hidden lg:block border-l border-stone-200"
              style={{ top: "var(--store-navbar-offset, 0px)" }}
            >
              <div className="flex justify-between items-center mb-8">
                <span className="font-serif italic text-xl">Filtros</span>
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="hover:rotate-90 transition-transform duration-300"
                >
                  <X size={24} strokeWidth={1} />
                </button>
              </div>

              <div className="space-y-8">
                {/* Search */}
                {catalog.showSearch && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-stone-400">
                      Buscar
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Buscar productos..."
                        className="w-full bg-white border border-stone-200 px-4 py-2 text-sm focus:outline-none focus:border-black transition-colors placeholder:text-stone-300"
                        autoFocus
                      />
                      <Search
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400"
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
                    <div className="flex flex-wrap gap-2">
                      {categories.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => toggleCategory(cat.id)}
                          className={`px-3 py-1 text-sm border transition-all ${
                            activeCategoryIds.includes(cat.id)
                              ? "border-black bg-black text-white"
                              : "border-stone-200 text-stone-600 hover:border-black"
                          }`}
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Price Range */}
                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-widest text-stone-400">
                    Rango de Precio
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-xs">
                        $
                      </span>
                      <input
                        type="number"
                        value={minPrice}
                        onChange={(e) => setMinPrice(Number(e.target.value))}
                        placeholder="Min"
                        className="w-full bg-white border border-stone-200 pl-6 pr-2 py-2 text-sm focus:outline-none focus:border-black"
                      />
                    </div>
                    <span className="text-stone-400">-</span>
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-xs">
                        $
                      </span>
                      <input
                        type="number"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(Number(e.target.value))}
                        placeholder="Max"
                        className="w-full bg-white border border-stone-200 pl-6 pr-2 py-2 text-sm focus:outline-none focus:border-black"
                      />
                    </div>
                  </div>
                </div>

                {/* Sort */}
                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-widest text-stone-400">
                    Ordenar por
                  </label>
                  <div className="flex flex-col gap-1">
                    {[
                      { label: "Relevancia", value: "" },
                      { label: "Precio: Menor a Mayor", value: "price-asc" },
                      { label: "Precio: Mayor a Menor", value: "price-desc" },
                      { label: "Más nuevos", value: "newest" },
                    ].map((opt) => (
                      <button
                        key={opt.label}
                        onClick={() => setSortOrder(opt.value)}
                        className={`text-left text-sm py-1 transition-colors ${sortOrder === opt.value ? "text-black font-medium" : "text-stone-500 hover:text-black"}`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-8 border-t border-stone-100 space-y-4">
                  {hasFeaturedProducts && (
                    <button
                      onClick={toggleFeaturedOnly}
                      className={`w-full py-3 text-xs uppercase tracking-widest border transition-colors ${
                        showFeaturedOnly
                          ? "bg-stone-900 text-white border-stone-900"
                          : "bg-white text-stone-500 border-stone-200 hover:border-stone-900 hover:text-stone-900"
                      }`}
                    >
                      {showFeaturedOnly ? "Ver Todos" : "Ver Solo Destacados"}
                    </button>
                  )}
                  <button
                    onClick={resetFilters}
                    className="w-full py-3 bg-stone-900 text-white text-xs uppercase tracking-widest hover:bg-black transition-colors"
                  >
                    Limpiar Todo
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Product Detail Modal */}
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
        />
      )}
      <WhatsAppFloatingButton phoneNumber={store.whatsapp} />
    </div>
  );
}
