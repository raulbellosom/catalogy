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
  ChevronRight,
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

export function RibbonTemplate({ store, products, isPreview = false }) {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  const theme = resolveThemeSettings(store);
  const catalog = resolveCatalogSettings(store);
  const fontFamily = resolveFontFamily(theme.font);
  const primary = theme.colors.primary || "#be185d"; // Default pink-700
  const secondary = theme.colors.secondary || "#fce7f3"; // Default pink-100

  // Featured Products
  const featuredProductIds = catalog.featuredProductIds || [];
  const featuredProducts =
    products?.filter((p) => featuredProductIds.includes(p.id || p.$id)) || [];

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
  } = useShoppingCart(store.id || store.$id);

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
      className="min-h-screen flex flex-col bg-stone-50 text-stone-900"
      style={{
        fontFamily,
        colorScheme: "light",
        "--ribbon-primary": primary,
        "--ribbon-secondary": secondary,
        "--store-navbar-offset": isPreview ? "2.5rem" : "0rem",
      }}
    >
      {/* Header Container (Fixed) */}
      <header className="fixed top-[var(--store-navbar-offset)] w-full z-50 transition-all duration-300">
        {/* Top Ribbon Banner - Decorative */}
        <div
          className="h-2 bg-[var(--ribbon-primary)] w-full shadow-sm"
          style={{
            background: `repeating-linear-gradient(45deg, ${primary}, ${primary} 10px, ${secondary} 10px, ${secondary} 20px)`,
          }}
        />

        {/* Header / Nav */}
        <nav className="bg-white/95 backdrop-blur-sm shadow-sm border-b border-stone-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
            {/* Left: Menu/Filter Trigger on all devices for 'Boutique' feel */}
            <button
              onClick={() => setIsFilterDrawerOpen(true)}
              className="p-2 -ml-2 text-stone-600 hover:text-[var(--ribbon-primary)] transition-colors flex items-center gap-2 group"
            >
              <Menu size={24} strokeWidth={1.5} />
              <span className="hidden md:inline text-xs font-bold uppercase tracking-widest group-hover:underline">
                Menú & Filtros
              </span>
            </button>

            {/* Center: Logo */}
            <div className="flex-1 flex justify-center">
              <div className="text-2xl font-black font-serif tracking-tight text-[var(--ribbon-primary)]">
                {store.logoFileId ? (
                  <img
                    src={getStoreLogoUrl(store.logoFileId)}
                    alt={store.name}
                    className="h-10 w-auto object-contain"
                  />
                ) : (
                  <span>{store.name}</span>
                )}
              </div>
            </div>

            {/* Right: Search and Cart */}
            <div className="w-[100px] flex justify-end items-center gap-2">
              {catalog.showSearch && (
                <button
                  onClick={() => setIsFilterDrawerOpen(true)} // Search lives in drawer
                  className="p-2 text-stone-500 hover:text-[var(--ribbon-primary)] transition-colors"
                >
                  <Search size={22} strokeWidth={1.5} />
                </button>
              )}
              {catalog.showCart && (
                <button
                  onClick={() => setIsCartOpen(true)}
                  className="relative p-2 text-stone-500 hover:text-[var(--ribbon-primary)] transition-colors"
                >
                  <ShoppingBag size={22} strokeWidth={1.5} />
                  {cart.length > 0 && (
                    <span className="absolute top-0 right-0 bg-[var(--ribbon-primary)] text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full">
                      {cart.length}
                    </span>
                  )}
                </button>
              )}
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <header className="relative py-12 md:py-20 text-center px-4 overflow-hidden mt-[calc(var(--store-navbar-offset)+6rem)]">
        <div className="relative z-10 max-w-3xl mx-auto space-y-6">
          <span className="inline-block px-4 py-1 rounded-full bg-[var(--ribbon-secondary)] text-[var(--ribbon-primary)] text-xs font-bold uppercase tracking-widest mb-4">
            Bienvenido a {store.name}
          </span>
          {store.description && (
            <p className="text-xl md:text-2xl text-stone-600 font-serif italic max-w-2xl mx-auto leading-relaxed">
              "{store.description}"
            </p>
          )}
        </div>

        {/* Decorative Ribbons BG */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-[var(--ribbon-secondary)] rounded-full blur-3xl opacity-50 mix-blend-multiply animate-pulse" />
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-[var(--ribbon-primary)] rounded-full blur-3xl opacity-20 mix-blend-multiply" />
      </header>

      {/* Main Content */}
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
        {/* Filter Categories Pills (Quick Access) */}
        {categories.length > 0 && catalog.showFilters && (
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            <button
              onClick={resetFilters}
              className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all border ${activeCategoryIds.length === 0 ? "bg-[var(--ribbon-primary)] text-white border-[var(--ribbon-primary)]" : "bg-white text-stone-500 border-stone-200 hover:border-[var(--ribbon-primary)]"}`}
            >
              Todos
            </button>
            {categories.slice(0, 5).map((cat) => (
              <button
                key={cat.id}
                onClick={() => toggleCategory(cat.id)}
                className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all border ${activeCategoryIds.includes(cat.id) ? "bg-[var(--ribbon-primary)] text-white border-[var(--ribbon-primary)]" : "bg-white text-stone-500 border-stone-200 hover:border-[var(--ribbon-primary)]"}`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {/* Product Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {filteredProducts.map((product) => {
              const imageUrl = product.imageFileIds?.[0]
                ? getProductImageUrl(product.imageFileIds[0])
                : null;

              return (
                <motion.div
                  key={product.$id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="group cursor-pointer flex flex-col"
                  onClick={() => setSelectedProduct(product)}
                >
                  <div className="relative aspect-[3/4] rounded-t-xl overflow-hidden bg-white shadow-sm group-hover:shadow-md transition-shadow">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-300 bg-stone-100">
                        <ShoppingBag size={32} />
                      </div>
                    )}

                    {/* Ribbon Tag Overlay */}
                    <div className="absolute top-4 left-0 flex flex-col items-start gap-1">
                      {/* Existing "New" tag if logic existed (it was hardcoded "Nuevo" in the view) - preserving it if it was dynamic, but it looks static. I'll just add Featured above or below. */}
                      <div className="bg-[var(--ribbon-secondary)] text-[var(--ribbon-primary)] text-[10px] font-bold px-3 py-1 shadow-sm rounded-r-full uppercase tracking-wider transform -translate-x-2 group-hover:translate-x-0 transition-transform">
                        Nuevo
                      </div>
                      {product.isFeatured && (
                        <div className="bg-[var(--ribbon-primary)] text-white text-[10px] font-bold px-3 py-1 shadow-sm rounded-r-full uppercase tracking-wider transform -translate-x-2 group-hover:translate-x-0 transition-transform delay-75">
                          Destacado
                        </div>
                      )}
                      {/* Buttons Overlay */}
                      {catalog.showShareButton && (
                        <div className="absolute top-2 right-2 flex flex-col gap-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              shareProduct(product);
                            }}
                            className="p-1.5 rounded-full bg-white/90 text-stone-600 hover:text-[var(--ribbon-primary)] shadow-sm"
                          >
                            <Share2 size={16} />
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
                              className="p-1.5 rounded-full bg-[#25D366] text-white hover:bg-[#20bd5a] shadow-sm"
                            >
                              <MessageCircle size={16} />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Info Card - "Tag" Look */}
                  <div className="relative -mt-6 mx-2 md:mx-4 bg-white p-4 rounded-xl shadow-md text-center border border-stone-100 flex flex-col gap-2 z-10 group-hover:-translate-y-1 transition-transform">
                    <h3 className="font-serif font-bold text-stone-900 text-lg leading-tight line-clamp-1">
                      {product.name}
                    </h3>
                    <div className="w-8 h-0.5 bg-[var(--ribbon-primary)]/20 mx-auto rounded-full" />
                    <p className="text-sm font-medium text-stone-500">
                      {formatPrice(product.price, product.currency)}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="py-24 text-center bg-white rounded-3xl border border-dashed border-stone-200">
            <ShoppingBag className="mx-auto h-12 w-12 text-stone-300 mb-4" />
            <h3 className="text-xl font-serif font-bold text-stone-900 mb-2">
              Colección vacía
            </h3>
            <p className="text-stone-500 mb-6">
              No encontramos productos con los filtros seleccionados.
            </p>
            <button
              onClick={resetFilters}
              className="text-[var(--ribbon-primary)] font-bold hover:underline"
            >
              Ver todo
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <StoreFooter
        store={store}
        config={{
          bg: "bg-white",
          text: "text-stone-500",
          border: "border-stone-100",
        }}
      />

      {/* Filter Drawer (Left Side) */}
      <AnimatePresence>
        {isFilterDrawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFilterDrawerOpen(false)}
              className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30 }}
              className="fixed inset-y-0 left-0 z-50 w-[300px] bg-white shadow-2xl flex flex-col overflow-hidden border-r-4 border-[var(--ribbon-primary)]"
              style={{ top: "var(--store-navbar-offset, 0px)" }}
            >
              <div className="p-8 bg-[var(--ribbon-secondary)] flex justify-between items-center">
                <h2 className="text-xl font-serif font-bold text-[var(--ribbon-primary)]">
                  Menú
                </h2>
                <button
                  onClick={() => setIsFilterDrawerOpen(false)}
                  className="text-[var(--ribbon-primary)] p-1 hover:bg-white/50 rounded-full transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex-grow overflow-y-auto p-8 space-y-10">
                {/* Search Input */}
                {catalog.showSearch && (
                  <div className="space-y-4">
                    <label className="text-xs font-bold uppercase tracking-widest text-stone-400">
                      Buscar
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Buscar..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full border-b-2 border-stone-200 py-2 pl-0 pr-8 text-sm outline-none focus:border-[var(--ribbon-primary)] bg-transparent placeholder:text-stone-300 transition-colors"
                      />
                      <Search
                        className="absolute right-0 top-1/2 -translate-y-1/2 text-stone-400"
                        size={18}
                      />
                    </div>
                  </div>
                )}

                {/* Categories Vertical */}
                {categories.length > 0 && (
                  <div className="space-y-4">
                    <label className="text-xs font-bold uppercase tracking-widest text-stone-400">
                      Colecciones
                    </label>
                    <div className="flex flex-col gap-3">
                      {categories.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => {
                            toggleCategory(cat.id);
                            setIsFilterDrawerOpen(false);
                          }}
                          className={`text-left text-sm py-1 flex items-center justify-between group ${activeCategoryIds.includes(cat.id) ? "font-bold text-[var(--ribbon-primary)]" : "text-stone-600 hover:text-[var(--ribbon-primary)]"}`}
                        >
                          <span>{cat.name}</span>
                          <ChevronRight
                            size={14}
                            className={`opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all ${activeCategoryIds.includes(cat.id) ? "opacity-100 translate-x-0" : ""}`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Featured Toggle */}
                {hasFeaturedProducts && (
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-widest text-stone-400">
                      Solo destacados
                    </label>
                    <button
                      onClick={toggleFeaturedOnly}
                      className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out ${
                        showFeaturedOnly
                          ? "bg-[var(--ribbon-primary)]"
                          : "bg-stone-200"
                      }`}
                    >
                      <div
                        className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-200 ease-in-out ${
                          showFeaturedOnly ? "translate-x-6" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                )}

                {/* Filters Actions */}
                <div className="pt-4 space-y-3">
                  <button
                    onClick={resetFilters}
                    className="w-full py-3 bg-stone-100 text-stone-600 text-xs font-bold uppercase tracking-widest hover:bg-stone-200 rounded-lg"
                  >
                    Limpiar Filtros
                  </button>
                  {store?.paymentLink && catalog.showPaymentButton && (
                    <a
                      href={store.paymentLink}
                      target="_blank"
                      className="block w-full py-3 bg-[var(--ribbon-primary)] text-white text-center text-xs font-bold uppercase tracking-widest rounded-lg shadow-lg hover:shadow-xl transition-shadow"
                    >
                      Ir al Checkout
                    </a>
                  )}
                </div>
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
        tone="ribbon"
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
          whatsappNumber={store.whatsapp}
          tone="ribbon"
        />
      )}
      <WhatsAppFloatingButton phoneNumber={store.whatsapp} />
    </div>
  );
}
