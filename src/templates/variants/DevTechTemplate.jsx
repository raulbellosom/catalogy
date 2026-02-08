import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Terminal,
  Code2,
  Cpu,
  Search,
  X,
  ChevronRight,
  ExternalLink,
  Share2,
  Zap,
  ShoppingBag,
} from "lucide-react";
import { getStoreLogoUrl } from "@/shared/services/storeService";
import {
  ProductDetailModal,
  ProductCard,
  StoreNavbar,
  StoreFooter,
  CatalogFilters,
  StorePurchaseInfo,
  shareProduct,
  CartDrawer,
  WhatsAppFloatingButton,
} from "../components";
import {
  useCatalogFilters,
  useShoppingCart,
  useProductDeepLink,
} from "../components/catalogHooks";
import { resolveThemeSettings } from "@/templates/registry";
import { resolveCatalogSettings } from "@/shared/utils/storeSettings";
import { ImageViewerModal } from "@/shared/ui/molecules/ImageViewerModal";
import { getProductImageUrl } from "@/shared/services/productService";

const resolveFontFamily = (fontId) => {
  const map = {
    inter: "'Inter', sans-serif",
    merriweather: "'Merriweather', serif",
    jetbrains: "'JetBrains Mono', monospace",
    roboto: "'Roboto', sans-serif",
    playfair: "'Playfair Display', serif",
    montserrat: "'Montserrat', sans-serif",
  };
  return map[fontId] || "'JetBrains Mono', monospace";
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

export function DevTechTemplate({ store, products, isPreview = false }) {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [booting, setBooting] = useState(true);
  const [bootLog, setBootLog] = useState([]);

  // Hooks
  const {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    isCartOpen,
    setIsCartOpen,
    getCartShareUrl,
    getCartWhatsAppMessage,
  } = useShoppingCart(store.id || store.$id, products);

  const initialProduct = useProductDeepLink(products);

  // Auto-open product from deep link
  useEffect(() => {
    if (initialProduct && products) {
      const product = products.find((p) => (p.id || p.$id) === initialProduct);
      if (product) {
        setSelectedProduct(product);
      }
    }
  }, [initialProduct, products]);

  // Mouse tracking for interactive glow effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Boot Sequence Effect
  useEffect(() => {
    const logs = [
      "> INITIALIZING KERNEL...",
      "> LOADING ASSETS...",
      "> MOUNTING VOLUMES...",
      "> ESTABLISHING SECURE CONNECTION...",
      `> CONNECTING TO ${store.name?.toUpperCase()}...`,
      "> ACCESS GRANTED.",
    ];

    let delay = 0;
    logs.forEach((log, index) => {
      delay += Math.random() * 300 + 100;
      setTimeout(() => {
        setBootLog((prev) => [...prev, log]);
      }, delay);
    });

    setTimeout(() => {
      setBooting(false);
    }, delay + 800);
  }, [store.name]);

  // -- Settings Resolution --
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

  const [viewer, setViewer] = useState({
    isOpen: false,
    images: [],
    index: 0,
  });

  const openViewer = (index, images) => {
    setViewer({ isOpen: true, images, index });
  };

  const handleShareCart = async () => {
    const url = getCartShareUrl();
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Mi carrito de ${store.name}`,
          url: url,
        });
      } catch (e) {
        console.error(e);
      }
    } else {
      navigator.clipboard.writeText(url);
      alert("Link del carrito copiado!");
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col bg-(--dev-bg) text-(--dev-text) selection:bg-(--dev-accent) selection:text-(--dev-bg) pt-[calc(var(--store-navbar-height)+var(--store-navbar-offset)+env(safe-area-inset-top))]"
      style={{
        fontFamily,
        colorScheme: "dark",
        "--dev-bg": secondary || "#0a0a0a",
        "--dev-text": "#e2e8f0",
        "--dev-accent": primary,
        "--dev-accent-glow": `${primary}40`,
        "--dev-surface": "rgba(255, 255, 255, 0.04)",
        "--dev-border": "rgba(255, 255, 255, 0.08)",
        "--store-navbar-height": "4rem",
        "--store-navbar-offset": isPreview ? "2.5rem" : "0rem",
      }}
    >
      <style>{`
        .dev-scanline {
          background: linear-gradient(
            to bottom,
            rgba(255,255,255,0),
            rgba(255,255,255,0) 50%,
            rgba(0,0,0,0.1) 50%,
            rgba(0,0,0,0.1)
          );
          background-size: 100% 4px;
          pointer-events: none;
        }
        @keyframes cursor-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .animate-cursor-blink {
          animation: cursor-blink 1s step-end infinite;
        }
      `}</style>

      {/* Boot Screen */}
      <AnimatePresence>
        {booting && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-[100] bg-black flex items-center justify-center font-mono text-xs md:text-sm text-[var(--dev-accent)]"
          >
            <div className="max-w-md w-full p-8 border border-[var(--dev-accent)] relative bg-black/90 shadow-[0_0_50px_-10px_var(--dev-accent-glow)]">
              <div className="absolute top-0 left-0 bg-[var(--dev-accent)] text-black px-2 pb-1 text-[10px] font-bold">
                SYSTEM_BOOT
              </div>
              <div className="space-y-1">
                {bootLog.map((log, i) => (
                  <p key={i}>{log}</p>
                ))}
                <p className="animate-cursor-blink">_</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Wrapper */}
      <motion.div
        animate={{ opacity: booting ? 0 : 1 }}
        transition={{ duration: 1 }}
        className="flex flex-col min-h-screen relative"
      >
        {/* Interactive Glow following cursor */}
        <div
          className="fixed pointer-events-none z-0 w-96 h-96 rounded-full blur-[100px] opacity-15"
          style={{
            background: `radial-gradient(circle, ${primary}, transparent 70%)`,
            left: mousePosition.x - 192,
            top: mousePosition.y - 192,
          }}
        />

        {/* Background Grid & Scanline Effect */}
        <div
          className="fixed inset-0 z-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(var(--dev-text) 1px, transparent 1px), linear-gradient(90deg, var(--dev-text) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
        <div className="fixed inset-0 pointer-events-none z-[1] dev-scanline opacity-20" />

        {/* Shared Navbar */}
        <StoreNavbar
          store={store}
          isPreview={isPreview}
          config={{
            bg: "bg-(--dev-bg)/80",
            text: "text-(--dev-text)",
            border: "border-(--dev-border)",
            accent: "text-(--dev-accent)",
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
          actions={
            <div className="flex items-center gap-4">
              {/* Cart Trigger */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 text-(--dev-text) hover:text-(--dev-accent) transition-colors"
              >
                <ShoppingBag size={20} />
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-(--dev-accent) text-(--dev-bg) text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {cart.length}
                  </span>
                )}
              </button>

              {store?.paymentLink && catalog.showPaymentButton && (
                <div className="hidden md:flex items-center gap-4">
                  <a
                    href={store.paymentLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-2 bg-(--dev-accent) text-(--dev-bg) rounded-lg text-sm font-bold hover:opacity-90 transition-opacity flex items-center gap-2"
                  >
                    <Zap size={16} /> Ir al pago
                  </a>
                </div>
              )}
            </div>
          }
        />

        {/* Hero Section - Compact */}
        <header className="relative z-10 py-12 md:py-16 border-b border-(--dev-border) overflow-hidden">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="flex flex-col md:flex-row items-center gap-6 md:gap-10"
            >
              {/* Logo */}
              {logoUrl ? (
                <motion.img
                  src={logoUrl}
                  alt={store?.name}
                  className="h-20 w-20 md:h-28 md:w-28 rounded-2xl object-cover border-2 border-(--dev-accent)/30 shadow-lg"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.7 }}
                />
              ) : (
                <motion.div
                  className="h-20 w-20 md:h-28 md:w-28 rounded-2xl bg-(--dev-surface) border border-(--dev-border) flex items-center justify-center"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  <Terminal className="h-10 w-10 text-(--dev-accent)" />
                </motion.div>
              )}

              {/* Store Info */}
              <div className="flex-1 text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-(--dev-border) bg-(--dev-surface) backdrop-blur-sm mb-3">
                  <span className="flex h-2 w-2 rounded-full bg-(--dev-accent) animate-pulse" />
                  <span className="text-[10px] font-mono text-(--dev-text)/60 uppercase tracking-widest">
                    Online
                  </span>
                </div>
                <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-3">
                  <span className="text-(--dev-accent)">&gt;</span>{" "}
                  {store?.name}
                  <span className="animate-cursor-blink text-(--dev-accent)">
                    _
                  </span>
                </h1>
                {store?.description && (
                  <p className="text-sm md:text-base text-(--dev-text)/60 max-w-xl line-clamp-2 leading-relaxed">
                    {store.description}
                  </p>
                )}
              </div>
            </motion.div>
          </div>
        </header>

        {/* Main Content */}
        <main className="grow z-10 py-10 md:py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Filters / Categories Bar (Desktop) */}
            {catalog.showFilters && categories?.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="mb-8 overflow-x-auto pb-2 scrollbar-hide hidden md:block"
              >
                <div className="flex gap-2 items-center">
                  <button
                    onClick={() =>
                      activeCategoryIds.length > 0 ? resetFilters() : null
                    }
                    className={`px-4 py-2 rounded-lg font-mono text-xs border transition-all whitespace-nowrap ${
                      activeCategoryIds.length === 0
                        ? "bg-(--dev-accent) border-(--dev-accent) text-(--dev-bg) font-bold"
                        : "bg-transparent border-(--dev-border) text-(--dev-text)/70 hover:border-(--dev-accent)/50"
                    }`}
                  >
                    ./all
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => toggleCategory(cat.id)}
                      className={`px-4 py-2 rounded-lg font-mono text-xs border transition-all whitespace-nowrap flex items-center gap-1.5 group ${
                        activeCategoryIds.includes(cat.id)
                          ? "bg-(--dev-accent)/10 border-(--dev-accent) text-(--dev-accent)"
                          : "bg-transparent border-(--dev-border) text-(--dev-text)/60 hover:border-(--dev-accent)/50 hover:text-(--dev-text)"
                      }`}
                    >
                      {activeCategoryIds.includes(cat.id) && (
                        <ChevronRight className="h-3 w-3" />
                      )}
                      {cat.name}
                    </button>
                  ))}
                  <button
                    onClick={resetFilters}
                    className="ml-auto px-3 py-2 text-xs text-(--dev-text)/50 hover:text-(--dev-accent) transition-colors font-mono"
                  >
                    [ reset ]
                  </button>
                </div>
              </motion.div>
            )}

            {/* Product Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {filteredProducts?.map((product, index) => {
                const imageId = product.imageFileIds?.[0];
                const imageUrl = imageId ? getProductImageUrl(imageId) : null;

                return (
                  <motion.div
                    key={product.id || product.$id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 + index * 0.05, duration: 0.3 }}
                    className="group relative flex flex-col bg-(--dev-surface) border border-(--dev-border) rounded-xl overflow-hidden hover:border-(--dev-accent)/50 hover:shadow-[0_0_30px_var(--dev-accent-glow)] transition-all duration-300 cursor-pointer"
                    onClick={() => setSelectedProduct(product)}
                  >
                    {/* Image Container */}
                    <div className="relative aspect-square overflow-hidden bg-black/20">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Code2 className="w-10 h-10 text-(--dev-text)/20" />
                        </div>
                      )}
                      {/* Tech Overlay Line on hover */}
                      <div className="absolute top-0 left-0 w-full h-0.5 bg-linear-to-r from-transparent via-(--dev-accent) to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      {/* Quick Actions */}
                      <div className="absolute bottom-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {catalog.showShareButton && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              shareProduct(product);
                            }}
                            className="p-1.5 bg-black/60 backdrop-blur-md rounded-md border border-white/10 text-white hover:bg-(--dev-accent) hover:text-(--dev-bg) transition-colors"
                          >
                            <Share2 size={14} />
                          </button>
                        )}
                        {imageUrl && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openViewer(
                                0,
                                product.imageFileIds?.map((id) =>
                                  getProductImageUrl(id),
                                ) || [],
                              );
                            }}
                            className="p-1.5 bg-black/60 backdrop-blur-md rounded-md border border-white/10 text-white hover:bg-(--dev-accent) hover:text-(--dev-bg) transition-colors"
                          >
                            <Search size={14} />
                          </button>
                        )}
                      </div>

                      {/* Featured Badge */}
                      {product.isFeatured && (
                        <div className="absolute top-2 right-2 bg-(--dev-accent) text-(--dev-bg) text-[9px] font-bold px-1.5 py-0.5 uppercase tracking-wider z-20 border border-(--dev-bg)/20">
                          [FEATURED]
                        </div>
                      )}
                    </div>

                    {/* Card Content */}
                    <div className="p-3 md:p-4 flex flex-col grow">
                      {/* Category Tag */}
                      {catalog.showFilters &&
                        product.categories &&
                        product.categories.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {product.categories.slice(0, 2).map((cat) => (
                              <button
                                key={cat.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleCategory(cat.id);
                                }}
                                className="text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded bg-(--dev-accent)/10 text-(--dev-accent) hover:bg-(--dev-accent) hover:text-(--dev-bg) transition-colors"
                              >
                                {cat.name}
                              </button>
                            ))}
                          </div>
                        )}

                      <h3 className="text-sm md:text-base font-semibold text-(--dev-text) mb-1 line-clamp-2 group-hover:text-(--dev-accent) transition-colors">
                        {product.name}
                      </h3>

                      <div className="mt-auto pt-2 flex items-center justify-between border-t border-(--dev-border)/50">
                        <div className="text-base md:text-lg font-bold text-(--dev-text)">
                          {formatPrice(product.price, product.currency)}
                        </div>
                        <span className="text-[10px] text-(--dev-text)/40 group-hover:text-(--dev-accent) transition-colors uppercase tracking-wider">
                          View <ChevronRight size={10} className="inline" />
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {(!filteredProducts || filteredProducts.length === 0) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-20 text-center border border-dashed border-(--dev-border) rounded-2xl bg-(--dev-surface)"
              >
                <Cpu className="h-12 w-12 mx-auto text-(--dev-text)/20 mb-4" />
                <p className="text-(--dev-text)/50 font-mono text-sm">
                  No modules found matching query.
                </p>
                <button
                  onClick={resetFilters}
                  className="mt-4 text-(--dev-accent) hover:underline text-xs font-mono"
                >
                  [ reset_filters ]
                </button>
              </motion.div>
            )}
          </div>
        </main>

        {/* Footer Section */}
        <div className="z-10 relative">
          {catalog.showPurchaseInfo && (
            <StorePurchaseInfo
              store={store}
              tone="dark"
              showPaymentButton={catalog.showPaymentButton}
              wrapperClassName="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-10"
            />
          )}
          <StoreFooter
            store={store}
            config={{
              bg: "bg-(--dev-surface)",
              text: "text-(--dev-text)/60",
              border: "border-(--dev-border)",
              muted: "text-(--dev-text)/40",
              accent: "text-(--dev-accent)",
            }}
          />
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileMenuOpen(false)}
                className="fixed inset-0 z-60 bg-black/70 backdrop-blur-sm md:hidden"
              />
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed inset-y-0 right-0 z-60 w-[85%] bg-(--dev-bg) p-6 pt-24 shadow-2xl overflow-y-auto md:hidden border-l border-(--dev-border)"
              >
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="absolute top-8 right-8 p-2 border border-(--dev-border) rounded-xl text-(--dev-text)"
                >
                  <X size={24} />
                </button>

                <div className="space-y-8">
                  {(catalog.showSearch || catalog.showFilters) && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between border-b border-(--dev-border) pb-2">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-(--dev-text)/50">
                          Búsqueda y Filtros
                        </h3>
                        <button
                          onClick={resetFilters}
                          className="text-[10px] font-bold uppercase tracking-widest text-(--dev-accent)"
                        >
                          Reiniciar
                        </button>
                      </div>
                      {catalog.showSearch && (
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-(--dev-text)/50" />
                          <input
                            type="search"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Buscar..."
                            className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none border border-(--dev-border) bg-(--dev-surface) text-(--dev-text) placeholder:text-(--dev-text)/40"
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
                    <div className="pt-6 border-t border-(--dev-border)">
                      <a
                        href={store.paymentLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-4 bg-(--dev-accent) text-(--dev-bg) rounded-xl font-bold flex items-center justify-center gap-2 whitespace-nowrap"
                      >
                        <ExternalLink size={18} /> Ir al pago
                      </a>
                    </div>
                  )}
                </div>
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
        <CartDrawer
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          cart={cart}
          onRemove={removeFromCart}
          onUpdateQty={updateQuantity}
          onShareCart={handleShareCart}
          onWhatsAppCheckout={getCartWhatsAppMessage}
          storeName={store.name}
          whatsappNumber={store.whatsapp}
        />
      </motion.div>
      <WhatsAppFloatingButton phoneNumber={store.whatsapp} tone="dark" />
    </div>
  );
}
