import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  ShoppingBag,
  X,
  Filter,
  Share2,
  ArrowRight,
  MessageCircle,
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

export function MinimalTemplate({ store, products, isPreview = false }) {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isFiltersCollapsed, setIsFiltersCollapsed] = useState(false); // For desktop toggle

  const theme = resolveThemeSettings(store);
  const catalog = resolveCatalogSettings(store);
  const fontFamily = resolveFontFamily(theme.font);
  const primary = theme.colors.primary || "#000000";
  const secondary = theme.colors.secondary || "#ffffff";

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

  const openViewer = (index, images, e) => {
    e?.stopPropagation();
    setViewer({ isOpen: true, images, index });
  };

  return (
    <div
      className="min-h-screen flex flex-col bg-white text-stone-900"
      style={{
        fontFamily,
        colorScheme: "light",
        "--minimal-accent": primary,
        "--store-navbar-offset": isPreview ? "2.5rem" : "0rem",
      }}
    >
      <style>{`
        .minimal-scroll::-webkit-scrollbar {
          width: 0px;
          background: transparent;
        }
      `}</style>

      {/* Navbar - Sticky & Clean */}
      <nav className="fixed top-[var(--store-navbar-offset)] w-full z-40 bg-white/90 backdrop-blur-md border-b border-stone-100 transition-all duration-300">
        <div className="max-w-[1400px] mx-auto px-6 h-20 flex items-center justify-between">
          <div className="text-xl font-bold tracking-tighter uppercase flex items-center gap-3">
            {store.logoFileId ? (
              <img
                src={getStoreLogoUrl(store.logoFileId)}
                alt={store.name}
                className="h-8 md:h-10 w-auto object-contain"
              />
            ) : (
              <span>{store.name}</span>
            )}
          </div>

          <div className="flex items-center gap-6">
            {catalog.showSearch && (
              <div className="hidden md:flex items-center bg-stone-50 rounded-full px-4 py-2 border border-stone-100 focus-within:border-stone-900 transition-colors w-64">
                <Search size={16} className="text-stone-400 mr-2" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent outline-none text-sm w-full placeholder:text-stone-400"
                />
              </div>
            )}

            {catalog.showCart && (
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2"
                title="Carrito"
              >
                <ShoppingBag size={20} className="text-stone-900" />
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-stone-900 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white">
                    {cart.length}
                  </span>
                )}
              </button>
            )}

            <button
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Filter size={24} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero / Intro */}
      <header className="px-6 py-20 md:py-32 max-w-[1400px] mx-auto w-full pt-[calc(var(--store-navbar-offset)+5rem+5rem)]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl"
        >
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-[0.9] mb-8 text-stone-900">
            {store.name}
            <span className="text-[var(--minimal-accent)]">.</span>
          </h1>
          {store.description && (
            <p className="text-xl md:text-2xl text-stone-500 font-light leading-relaxed max-w-2xl">
              {store.description}
            </p>
          )}
        </motion.div>
      </header>

      {/* Main Layout: Sticky Sidebar + Grid */}
      <main className="flex-grow w-full max-w-[1400px] mx-auto px-6 pb-32 flex flex-col md:flex-row gap-12 relative">
        {/* Desktop Sidebar */}
        {catalog.showFilters && (
          <aside
            className={`hidden md:block w-64 flex-shrink-0 sticky top-[calc(var(--store-navbar-offset)+6rem)] h-[calc(100vh-8rem)] overflow-y-auto minimal-scroll pr-4 transition-all duration-500 ${isFiltersCollapsed ? "-ml-[17rem] opacity-0 pointer-events-none" : ""}`}
          >
            <div className="space-y-10">
              <div>
                <div className="flex justify-between items-baseline mb-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-stone-400">
                    Categorías
                  </h3>
                  <button
                    onClick={resetFilters}
                    className="text-[10px] uppercase font-bold text-stone-900 underline"
                  >
                    Reset
                  </button>
                </div>
                <div className="flex flex-col gap-1">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => toggleCategory(cat.id)}
                      className={`text-left py-2 px-3 rounded-md text-sm transition-all ${activeCategoryIds.includes(cat.id) ? "bg-stone-900 text-white font-medium" : "text-stone-600 hover:bg-stone-100"}`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-4">
                  Precio
                </h3>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(Number(e.target.value))}
                    className="w-full bg-stone-50 border border-stone-200 p-2 text-sm rounded-md focus:outline-none focus:border-stone-900"
                  />
                  <span className="text-stone-400">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="w-full bg-stone-50 border border-stone-200 p-2 text-sm rounded-md focus:outline-none focus:border-stone-900"
                  />
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-4">
                  Ordenar
                </h3>
                <div className="relative">
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 p-2 text-sm rounded-md appearance-none focus:outline-none focus:border-stone-900"
                  >
                    <option value="">Relevancia</option>
                    <option value="price-asc">Menor precio</option>
                    <option value="price-desc">Mayor precio</option>
                  </select>
                  <ArrowRight
                    size={14}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 rotate-90"
                  />
                </div>
              </div>

              {hasFeaturedProducts && (
                <div className="pt-6 border-t border-gray-100">
                  <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4">
                    Destacados
                  </h3>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div
                      className={`w-5 h-5 border rounded flex items-center justify-center transition-colors ${
                        showFeaturedOnly
                          ? "bg-black border-black"
                          : "border-gray-300 group-hover:border-black"
                      }`}
                    >
                      {showFeaturedOnly && (
                        <Check size={14} className="text-white" />
                      )}
                    </div>
                    <span className="text-sm text-gray-600 group-hover:text-black transition-colors">
                      Ver solo destacados
                    </span>
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={showFeaturedOnly}
                      onChange={toggleFeaturedOnly}
                    />
                  </label>
                </div>
              )}
            </div>
          </aside>
        )}

        {/* Product Grid */}
        <div className="flex-1 min-w-0">
          {/* Filter Toggle (If needed) & Product Count */}
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-stone-100">
            <div className="text-sm font-medium text-stone-500">
              {filteredProducts.length} Productos
            </div>
            {catalog.showFilters && (
              <button
                onClick={() => setIsFiltersCollapsed(!isFiltersCollapsed)}
                className="hidden md:flex items-center gap-2 text-xs font-bold uppercase tracking-widest hover:text-[var(--minimal-accent)]"
              >
                <Filter size={14} />
                {isFiltersCollapsed ? "Mostrar Filtros" : "Ocultar Filtros"}
              </button>
            )}
          </div>

          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
              {filteredProducts.map((product) => {
                const imageUrl = product.imageFileIds?.[0]
                  ? getProductImageUrl(product.imageFileIds[0])
                  : null;

                return (
                  <motion.div
                    key={product.$id}
                    layoutId={product.$id}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="group cursor-pointer flex flex-col gap-4"
                    onClick={() => setSelectedProduct(product)}
                  >
                    <div className="aspect-[3/4] bg-stone-100 relative overflow-hidden">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-stone-300">
                          <ShoppingBag size={32} />
                        </div>
                      )}

                      {catalog.showShareButton && (
                        <div className="absolute top-3 right-3 flex flex-col gap-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              shareProduct(product);
                            }}
                            className="p-2 bg-white/90 backdrop-blur-sm rounded-full text-stone-900 hover:bg-white shadow-sm"
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
                              className="p-2 bg-[#25D366] text-white rounded-full hover:bg-[#20bd5a] shadow-sm"
                            >
                              <MessageCircle size={16} />
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-base font-bold text-stone-900 leading-tight group-hover:underline decoration-1 underline-offset-4 decoration-stone-900/30">
                        {product.name}
                      </h3>
                      <p className="text-sm text-stone-500 font-medium">
                        {formatPrice(product.price, product.currency)}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="py-24 text-center">
              <h3 className="text-xl font-bold mb-2">Sin resultados</h3>
              <p className="text-stone-500 mb-6">
                No encontramos productos con esos filtros.
              </p>
              <button
                onClick={resetFilters}
                className="text-sm font-bold underline"
              >
                Limpiar filtros
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <StoreFooter
        store={store}
        config={{
          bg: "bg-stone-900",
          text: "text-stone-400",
          border: "border-stone-800",
        }}
      />

      {/* Mobile Menu & Filters (Drawer) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 z-50 bg-stone-900/20 backdrop-blur-sm md:hidden"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30 }}
              className="fixed inset-y-0 right-0 z-50 w-[85%] max-w-sm bg-white p-6 pt-20 flex flex-col md:hidden overflow-hidden"
              style={{ top: "var(--store-navbar-offset, 0px)" }}
            >
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="absolute top-6 right-6 p-2"
              >
                <X size={24} />
              </button>

              <div className="flex-grow overflow-y-auto space-y-8 pb-8 overflow-x-hidden">
                <h2 className="text-2xl font-bold tracking-tight mb-6">
                  Filtros
                </h2>

                {/* Search Mobile */}
                {catalog.showSearch && (
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Buscar..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-stone-50 p-4 rounded-lg text-sm outline-none border border-stone-200"
                    />
                    <Search
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400"
                      size={18}
                    />
                  </div>
                )}

                {/* Categories List Mobile */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">
                    Categorías
                  </h3>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => toggleCategory(cat.id)}
                      className={`w-full text-left py-3 border-b border-stone-100 text-sm font-medium ${activeCategoryIds.includes(cat.id) ? "text-stone-900 border-stone-900" : "text-stone-500"}`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>

                {/* Actions Mobile */}
                <div className="pt-8 space-y-4">
                  <button
                    onClick={resetFilters}
                    className="w-full py-3 border border-stone-200 text-stone-900 font-bold text-xs uppercase tracking-widest"
                  >
                    Limpiar
                  </button>
                  {store?.paymentLink && catalog.showPaymentButton && (
                    <a
                      href={store.paymentLink}
                      target="_blank"
                      className="block w-full py-4 bg-stone-900 text-white text-center font-bold text-xs uppercase tracking-widest"
                    >
                      Ir al pago
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
        tone="minimal"
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
        />
      )}
      <WhatsAppFloatingButton phoneNumber={store.whatsapp} />
    </div>
  );
}
