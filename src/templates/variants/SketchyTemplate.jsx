import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  ShoppingBag,
  X,
  Filter,
  Share2,
  MessageCircle,
  Menu,
  Eraser,
} from "lucide-react";
import { getStoreLogoUrl } from "@/shared/services/storeService";
import { getProductImageUrl } from "@/shared/services/productService";
import {
  ProductDetailModal,
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
import { Logo } from "@/shared/ui/atoms/Logo";

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

// Hand-drawn SVG components
const Tape = ({ className = "" }) => (
  <div
    className={`absolute w-24 h-8 bg-yellow-100/80 -rotate-3 z-10 shadow-sm opacity-90 backdrop-blur-[1px] ${className}`}
    style={{
      clipPath:
        "polygon(2% 0%, 98% 0%, 100% 10%, 98% 20%, 100% 30%, 98% 40%, 100% 50%, 98% 60%, 100% 70%, 98% 80%, 100% 90%, 98% 100%, 2% 100%, 0% 90%, 2% 80%, 0% 70%, 2% 60%, 0% 50%, 2% 40%, 0% 30%, 2% 20%, 0% 10%)",
    }}
  />
);

export function SketchyTemplate({ store, products, isPreview = false }) {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const theme = resolveThemeSettings(store);
  const catalog = resolveCatalogSettings(store);
  const fontFamily = resolveFontFamily(theme.font);
  const primary = theme.colors.primary || "#2563eb"; // Blue pen default
  const secondary = theme.colors.secondary || "#fefce8"; // Paper default

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
      className="min-h-screen flex flex-col pt-[calc(var(--store-navbar-height)+var(--store-navbar-offset)+env(safe-area-inset-top))]"
      style={{
        fontFamily,
        colorScheme: "light",
        "--sketchy-primary": primary,
        "--store-navbar-height": "5rem",
        "--store-navbar-offset": isPreview ? "2.5rem" : "0rem",
        backgroundColor: secondary,
        // Notebook ruled paper effect
        backgroundImage: `linear-gradient(${secondary} 97%, #e5e7eb 97%)`,
        backgroundSize: "100% 2rem",
      }}
    >
      <style>{`
        .sketchy-border {
            border-radius: 2px 255px 3px 25px / 255px 6px 225px 9px;
            box-shadow: 2px 2px 0 0 rgba(0,0,0,0.1);
        }
        .sketchy-input {
            background: transparent;
            border-bottom: 2px solid ${primary};
            border-radius: 0;
        }
        @import url('https://fonts.googleapis.com/css2?family=Cabin+Sketch:wght@400;700&display=swap');
      `}</style>

      {/* Navbar: Sticky Note Header */}
      <nav className="fixed top-[var(--store-navbar-offset)] left-0 right-0 z-50 transition-all duration-300 h-20">
        <div className="absolute inset-0 bg-white shadow-md -skew-y-1 origin-top-left border-b-2 border-stone-200" />
        <div className="relative max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2 transform -rotate-1">
            <div className="text-3xl font-bold" style={{ color: primary }}>
              {store.logoFileId ? (
                <img
                  src={getStoreLogoUrl(store.logoFileId)}
                  alt={store.name}
                  className="h-12 w-auto object-contain sketchy-border bg-white p-1"
                />
              ) : (
                <span>{store.name}</span>
              )}
            </div>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {catalog.showSearch && (
              <div className="relative transform rotate-1">
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="sketchy-input px-2 py-1 outline-none text-lg font-bold placeholder:text-stone-400 w-48 focus:w-64 transition-all"
                  style={{ borderColor: primary, color: primary }}
                />
                <Search
                  className="absolute right-0 top-1/2 -translate-y-1/2 opacity-50"
                  size={18}
                />
              </div>
            )}
            <button
              onClick={() => setShowFilters(true)}
              className="flex items-center gap-2 font-bold hover:underline decoration-2 underline-offset-4"
              style={{ color: primary }}
            >
              <Filter size={20} className="stroke-[3]" />
              Filtros
            </button>
            {catalog.showCart && (
              <button
                onClick={() => setIsCartOpen(true)}
                className="flex items-center justify-center p-2 font-bold hover:underline decoration-2 underline-offset-4 relative"
                style={{ color: primary }}
                aria-label="Carrito"
              >
                <ShoppingBag size={20} className="stroke-[3]" />
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-black rounded-full h-4 w-4 flex items-center justify-center sketchy-border">
                    {cart.length}
                  </span>
                )}
              </button>
            )}
          </div>

          {/* Mobile Toggle */}
          <div className="flex md:hidden items-center gap-4">
            {catalog.showCart && (
              <button
                className="relative z-50"
                onClick={() => setIsCartOpen(true)}
                style={{ color: primary }}
              >
                <ShoppingBag size={24} className="stroke-[3]" />
                {cart.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-black rounded-full h-4 w-4 flex items-center justify-center">
                    {cart.length}
                  </span>
                )}
              </button>
            )}
            <button
              className="relative z-50 text-stone-800"
              onClick={() => setShowFilters(true)}
            >
              <Menu size={28} className="stroke-[3]" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section: Hand-drawn Title */}
      <header className="px-4 py-16 md:py-24 text-center relative overflow-hidden">
        <div className="relative z-10 max-w-2xl mx-auto transform -rotate-1">
          <h1
            className="text-5xl md:text-8xl font-black mb-6 drop-shadow-sm"
            style={{ color: primary }}
          >
            {store.name}
          </h1>
          {store.description && (
            <div className="inline-block bg-yellow-100 p-6 shadow-md transform rotate-2 max-w-lg mx-auto relative">
              <Tape className="-top-3 -left-2 w-16" />
              <p className="text-xl md:text-2xl font-bold text-stone-800 leading-relaxed font-sans">
                {store.description}
              </p>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
        {/* Categories "Tags" */}
        {catalog.showFilters && categories.length > 0 && (
          <div className="flex flex-wrap justify-center gap-4 mb-16">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => toggleCategory(cat.id)}
                className={`text-lg font-bold px-4 py-1 border-2 transition-transform hover:-translate-y-1 hover:rotate-1 transform ${activeCategoryIds.includes(cat.id) ? "bg-stone-900 text-white border-stone-900 -rotate-2 shadow-lg" : "bg-white text-stone-600 border-stone-300 rotate-1 shadow-sm"}`}
                style={{
                  borderRadius: "255px 15px 225px 15px/15px 225px 15px 255px",
                }}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {/* Product Grid: Polaroids */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12 px-4">
          {filteredProducts.map((product, idx) => {
            const imageUrl = product.imageFileIds?.[0]
              ? getProductImageUrl(product.imageFileIds[0])
              : null;
            const rotation = idx % 2 === 0 ? "rotate-1" : "-rotate-1";

            return (
              <motion.div
                key={product.$id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02, rotate: 0 }}
                className={`group cursor-pointer bg-white p-4 pb-16 shadow-lg border border-stone-200 transform ${rotation} transition-all duration-300 relative`}
                onClick={() => setSelectedProduct(product)}
                style={{ borderRadius: "2px" }}
              >
                {/* Tape Effect */}
                <Tape className="-top-3 left-[40%]" />

                {/* Image Area */}
                <div className="aspect-[4/5] bg-stone-100 overflow-hidden border-2 border-stone-100 mb-4 relative grayscale-[10%] group-hover:grayscale-0 transition-all duration-500">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-300">
                      <ShoppingBag size={48} className="stroke-1" />
                    </div>
                  )}
                </div>

                {/* Handwritten Details */}
                <div className="text-center font-handwriting">
                  <h3 className="text-2xl font-bold text-stone-800 mb-1 leading-none">
                    {product.name}
                  </h3>
                  <p className="text-xl font-bold" style={{ color: primary }}>
                    {formatPrice(product.price, product.currency)}
                  </p>
                </div>

                {/* Hover Action: Scribble Button */}
                <div className="absolute bottom-4 left-0 right-0 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="bg-stone-900 text-white px-4 py-1 text-sm font-bold uppercase tracking-widest transform -rotate-2 sketchy-border">
                    Ver Detalle
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {filteredProducts.length === 0 && (
          <div className="py-24 text-center">
            <div className="inline-block border-4 border-dashed border-stone-300 p-12 rounded-full mb-6">
              <Eraser size={48} className="text-stone-400" />
            </div>
            <h3 className="text-3xl font-bold text-stone-400">
              Nada por aquí...
            </h3>
            <button
              onClick={resetFilters}
              className="mt-6 text-xl font-bold underline decoration-wavy decoration-2 underline-offset-4"
              style={{ color: primary }}
            >
              Borrar garabatos (Filtros)
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <StoreFooter
        store={store}
        config={{
          bg: "bg-white",
          text: "text-stone-900",
          border: "border-black",
        }}
      />

      {/* Sidebar Doodle (Filters) */}
      <AnimatePresence>
        {showFilters && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFilters(false)}
              className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: "100%", rotate: 2 }}
              animate={{ x: 0, rotate: 0 }}
              exit={{ x: "100%", rotate: 2 }}
              transition={{ type: "spring", damping: 20 }}
              className="fixed top-[var(--store-navbar-offset)] bottom-0 right-0 z-[60] w-full max-w-sm bg-yellow-50 shadow-2xl p-4 sm:p-8 flex flex-col border-l-4 border-stone-900 overflow-y-auto overflow-x-hidden"
              style={{
                backgroundImage:
                  "radial-gradient(#d6d3d1 1px, transparent 1px)",
                backgroundSize: "20px 20px",
              }}
            >
              <div className="flex justify-between items-center mb-4 sm:mb-8 pb-4 border-b-2 border-stone-900 border-dashed">
                <h2 className="text-2xl sm:text-3xl font-black transform -rotate-1 text-stone-900">
                  Mis Filtros
                </h2>
                <button
                  onClick={() => setShowFilters(false)}
                  className="text-stone-900"
                >
                  <X size={28} className="stroke-[3] sm:w-8 sm:h-8" />
                </button>
              </div>

              <div className="space-y-4 sm:space-y-8 flex-grow overflow-y-auto overflow-x-hidden">
                {/* Search */}
                <div className="bg-white p-3 sm:p-4 shadow-md transform rotate-1 border-2 border-stone-200">
                  <label className="block font-bold mb-2 uppercase text-[10px] sm:text-xs tracking-widest text-stone-500">
                    Búsqueda
                  </label>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full text-base sm:text-lg font-bold outline-none border-b-2 border-stone-300 focus:border-black transition-colors bg-transparent text-stone-900"
                    placeholder="..."
                  />
                </div>

                {/* Price Doodle */}
                <div className="bg-white p-3 sm:p-4 shadow-md transform -rotate-1 border-2 border-stone-200">
                  <label className="block font-bold mb-2 uppercase text-[10px] sm:text-xs tracking-widest text-stone-500">
                    Precio ($)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={minPrice}
                      onChange={(e) => setMinPrice(Number(e.target.value))}
                      className="w-full border-2 border-stone-200 p-1.5 sm:p-2 font-bold rounded-md text-sm sm:text-base text-stone-900"
                      placeholder="Min"
                    />
                    <input
                      type="number"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(Number(e.target.value))}
                      className="w-full border-2 border-stone-200 p-1.5 sm:p-2 font-bold rounded-md text-sm sm:text-base text-stone-900"
                      placeholder="Max"
                    />
                  </div>
                </div>

                {/* Filters Component */}
                <CatalogFilters
                  showSort={catalog.showSort}
                  showPrice={catalog.showFilters}
                  showCategories={catalog.showFilters}
                  showFeaturedOnly={showFeaturedOnly}
                  onToggleFeaturedOnly={toggleFeaturedOnly}
                  hasFeaturedProducts={hasFeaturedProducts}
                  tone="sketchy"
                />

                {/* Actions */}
                <div className="pt-2 sm:pt-4 space-y-4">
                  <button
                    onClick={resetFilters}
                    className="w-full py-3 sm:py-4 bg-stone-900 text-white font-black text-lg sm:text-xl hover:bg-stone-800 transition-colors transform rotate-1 shadow-lg"
                  >
                    LIMPIAR TODO
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Modals */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        store={store}
        tone="light" // Use light tone but maybe we can custom style later
        showShareButton={catalog.showShareButton}
        showPaymentButton={catalog.showPaymentButton}
        onAddToCart={addToCart}
      />
      <ImageViewerModal
        isOpen={viewer.isOpen}
        onClose={() => setViewer((v) => ({ ...v, isOpen: false }))}
        images={viewer.images}
        initialIndex={viewer.index}
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
          whatsappNumber={store.whatsapp}
          tone="light"
        />
      )}
      <WhatsAppFloatingButton phoneNumber={store.whatsapp} />
    </div>
  );
}
