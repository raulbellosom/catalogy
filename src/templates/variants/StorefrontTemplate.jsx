import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  ShoppingBag,
  X,
  Filter,
  Share2,
  ArrowLeft,
  ArrowRight,
  Menu,
  Pause,
  Play,
} from "lucide-react";
import { getStoreLogoUrl } from "@/shared/services/storeService";
import { getProductImageUrl } from "@/shared/services/productService";
import {
  ProductDetailModal,
  StoreFooter,
  CatalogFilters,
  StorePurchaseInfo,
  shareProduct,
} from "../components";
import { ImageViewerModal } from "@/shared/ui/molecules/ImageViewerModal";
import { useCatalogFilters } from "../components/catalogHooks";
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

export function StorefrontTemplate({ store, products, isPreview = false }) {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const theme = resolveThemeSettings(store);
  const catalog = resolveCatalogSettings(store);
  const fontFamily = resolveFontFamily(theme.font);
  const primary = theme.colors.primary || "#000000";
  const secondary = theme.colors.secondary || "#ffffff";

  // Hero Carousel Logic
  const featuredProductIds = catalog.featuredProductIds || [];
  const [heroIndex, setHeroIndex] = useState(0);
  const [isCarouselPaused, setIsCarouselPaused] = useState(false);

  const heroProducts = (() => {
    let productsToShow = [];

    // 1. Get explicitly featured products
    if (featuredProductIds.length > 0) {
      productsToShow =
        products?.filter((p) => featuredProductIds.includes(p.id || p.$id)) ||
        [];
    }

    // 2. If not enough featured (e.g. less than 5), fill with regular products
    // User requested: "complement options with normal products but without showing they are featured"
    if (productsToShow.length < 5 && products?.length > 0) {
      const remainingSlots = 5 - productsToShow.length;
      const otherProducts = products.filter(
        (p) =>
          !productsToShow.find((fp) => (fp.id || fp.$id) === (p.id || p.$id)),
      );

      // Add up to remainingSlots from otherProducts
      productsToShow = [
        ...productsToShow,
        ...otherProducts.slice(0, remainingSlots),
      ];
    }

    // 3. Fallback if still empty (no products at all)
    if (productsToShow.length === 0 && products?.length > 0) {
      return products.slice(0, 1);
    }

    return productsToShow;
  })();

  const activeHeroProduct = heroProducts[heroIndex];

  // Auto-advance carousel
  useEffect(() => {
    if (heroProducts.length <= 1 || isCarouselPaused) return;

    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroProducts.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [heroProducts.length, isCarouselPaused]);

  // Helper to check if current hero product is actually in the featured list
  const isFeatured = (product) => {
    if (!product) return false;
    return featuredProductIds.includes(product.id || product.$id);
  };

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

  // ImageViewer State
  const [viewer, setViewer] = useState({
    isOpen: false,
    images: [],
    index: 0,
  });

  return (
    <div
      className="min-h-screen flex flex-col bg-white text-stone-900"
      style={{
        fontFamily,
        colorScheme: "light",
        "--storefront-primary": primary,
        "--store-navbar-offset": isPreview ? "2.5rem" : "0rem",
      }}
    >
      <style>{`
        .storefront-hero-text {
            text-shadow: 0 4px 12px rgba(0,0,0,0.3);
        }
      `}</style>

      {/* Header Container (Fixed) */}
      <header className="fixed top-[var(--store-navbar-offset)] w-full z-50 transition-all duration-300">
        {/* Navbar */}
        <nav className="bg-white/95 backdrop-blur-md border-b border-stone-100 transition-all">
          <div className="max-w-[1600px] mx-auto px-6 h-20 flex items-center justify-between">
            {/* Logo & Store Name */}
            <div className="flex items-center gap-4">
              {store.logoFileId && (
                <img
                  src={getStoreLogoUrl(store.logoFileId)}
                  alt={store.name}
                  className="h-10 w-auto object-contain"
                />
              )}
              <span className="text-xl font-black tracking-tighter uppercase">
                {store.name}
              </span>
            </div>

            {/* Desktop Center Nav */}
            <div className="hidden md:flex items-center gap-8">
              {/* No categories here - kept minimal */}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-6">
              {catalog.showSearch && (
                <div className="hidden lg:flex items-center relative group">
                  <input
                    type="text"
                    placeholder="Buscar..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-stone-50 border-b border-stone-200 outline-none px-2 py-1 text-sm w-32 focus:w-64 transition-all focus:border-black"
                  />
                  <Search
                    size={16}
                    className="text-stone-400 absolute right-2 pointer-events-none"
                  />
                </div>
              )}

              <button
                className="md:hidden"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu size={24} />
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section (Flagship Style) */}
      <header className="relative w-full h-[calc(100dvh-5rem-var(--store-navbar-offset))] bg-stone-900 overflow-hidden mt-[calc(var(--store-navbar-offset)+5rem)]">
        <AnimatePresence mode="wait">
          {activeHeroProduct ? (
            <div
              key={activeHeroProduct.id || activeHeroProduct.$id}
              className="absolute inset-0 w-full h-full"
            >
              {/* Background Image Layer */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1 }}
                className="absolute inset-0"
              >
                {activeHeroProduct.imageFileIds?.[0] ? (
                  <img
                    src={getProductImageUrl(activeHeroProduct.imageFileIds[0])}
                    alt={activeHeroProduct.name}
                    className="w-full h-full object-cover opacity-80"
                  />
                ) : (
                  <div className="w-full h-full bg-stone-800 flex items-center justify-center">
                    <ShoppingBag className="w-24 h-24 text-stone-700" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/30" />
              </motion.div>

              {/* Content Layer */}
              <div className="absolute bottom-0 left-0 w-full p-8 md:p-20 text-white z-10">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="max-w-4xl"
                >
                  {isFeatured(activeHeroProduct) && (
                    <span className="inline-block px-3 py-1 bg-white text-black text-xs font-bold uppercase tracking-widest mb-4">
                      Destacado
                    </span>
                  )}

                  <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter mb-6 storefront-hero-text leading-[0.9]">
                    {activeHeroProduct.name}
                  </h1>
                  <p className="text-xl md:text-2xl font-medium mb-8 text-stone-200">
                    {formatPrice(activeHeroProduct.price)}
                  </p>

                  <div className="flex gap-4">
                    <button
                      onClick={() => setSelectedProduct(activeHeroProduct)}
                      className="px-8 py-4 bg-white text-black font-bold uppercase tracking-widest hover:bg-stone-200 transition-colors flex items-center gap-4"
                    >
                      Ver Producto <ArrowRight size={20} />
                    </button>
                  </div>
                </motion.div>
              </div>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-white">
              <h1 className="text-4xl font-bold">Bienvenido a {store.name}</h1>
            </div>
          )}
        </AnimatePresence>

        {/* Carousel Controls */}
        {heroProducts.length > 1 && (
          <div className="absolute top-8 right-8 z-20 flex flex-col items-end gap-4 md:flex-row md:items-center">
            <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md p-2 rounded-full border border-white/10">
              <button
                onClick={() =>
                  setHeroIndex(
                    (prev) =>
                      (prev - 1 + heroProducts.length) % heroProducts.length,
                  )
                }
                className="p-2 rounded-full hover:bg-white/20 text-white transition-colors"
              >
                <ArrowLeft size={20} />
              </button>

              <button
                onClick={() => setIsCarouselPaused(!isCarouselPaused)}
                className="p-2 rounded-full hover:bg-white/20 text-white transition-colors"
              >
                {isCarouselPaused ? <Play size={16} /> : <Pause size={16} />}
              </button>

              <button
                onClick={() =>
                  setHeroIndex((prev) => (prev + 1) % heroProducts.length)
                }
                className="p-2 rounded-full hover:bg-white/20 text-white transition-colors"
              >
                <ArrowRight size={20} />
              </button>
            </div>

            {/* Dots Indicator */}
            <div className="flex gap-2">
              {heroProducts.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setHeroIndex(idx)}
                  className={`h-1 transition-all duration-300 ${
                    idx === heroIndex
                      ? "w-8 bg-white"
                      : "w-4 bg-white/40 hover:bg-white/60"
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Scrollable Categories Strip */}
      {catalog.showFilters && categories.length > 0 && (
        <div className="border-b border-stone-100 bg-white py-8">
          <div className="max-w-[1600px] mx-auto px-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-bold uppercase tracking-widest text-stone-900">
                Departamentos
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const container = document.getElementById("cat-scroll");
                    if (container) container.scrollLeft -= 200;
                  }}
                  className="p-2 border border-stone-200 rounded-full hover:bg-stone-50"
                >
                  <ArrowRight className="rotate-180" size={16} />
                </button>
                <button
                  onClick={() => {
                    const container = document.getElementById("cat-scroll");
                    if (container) container.scrollLeft += 200;
                  }}
                  className="p-2 border border-stone-200 rounded-full hover:bg-stone-50"
                >
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
            <div
              id="cat-scroll"
              className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide snap-x scroll-smooth"
            >
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => toggleCategory(cat.id)}
                  className={`snap-start shrink-0 w-64 h-32 bg-stone-50 flex items-center justify-center border hover:border-black transition-all group relative overflow-hidden ${activeCategoryIds.includes(cat.id) ? "border-black bg-stone-100" : "border-stone-100"}`}
                >
                  <span className="relative z-10 text-lg font-bold uppercase tracking-widest group-hover:scale-105 transition-transform">
                    {cat.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Product Grid */}
      <main className="max-w-[1600px] mx-auto px-6 py-20 w-full">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight">
            Catálogo Completo
          </h2>
          <div className="flex items-center gap-4">
            {/* Filters Trigger */}
            {catalog.showFilters && (
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest border border-stone-200 px-4 py-2 hover:bg-stone-50"
              >
                <Filter size={16} /> Filtros
              </button>
            )}
            <div className="text-sm font-medium text-stone-500 hidden md:block">
              {filteredProducts.length} items
            </div>
          </div>
        </div>

        {/* Collapsible Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-12 bg-stone-50 p-6 md:p-10"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div>
                  <h4 className="font-bold uppercase text-xs mb-4">Ordenar</h4>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="w-full bg-white border border-stone-200 p-3 text-sm font-bold outline-none"
                  >
                    <option value="">Relevancia</option>
                    <option value="price-asc">Menor Precio</option>
                    <option value="price-desc">Mayor Precio</option>
                  </select>
                </div>
                <div>
                  <h4 className="font-bold uppercase text-xs mb-4">Precio</h4>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={minPrice}
                      onChange={(e) => setMinPrice(Number(e.target.value))}
                      className="w-full bg-white border border-stone-200 p-3 text-sm"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(Number(e.target.value))}
                      className="w-full bg-white border border-stone-200 p-3 text-sm"
                    />
                  </div>
                </div>
                <div className="md:col-span-2 flex items-end justify-end">
                  <button
                    onClick={resetFilters}
                    className="text-xs font-bold uppercase underline"
                  >
                    Limpiar filtros
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-12">
            {filteredProducts.map((product) => {
              const imageUrl = product.imageFileIds?.[0]
                ? getProductImageUrl(product.imageFileIds[0])
                : null;

              return (
                <div
                  key={product.$id}
                  onClick={() => setSelectedProduct(product)}
                  className="group cursor-pointer"
                >
                  <div className="aspect-[3/4] bg-stone-100 mb-4 relative overflow-hidden">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag className="text-stone-300" />
                      </div>
                    )}

                    {/* Featured Badge */}
                    {product.isFeatured && (
                      <div className="absolute top-2 right-2 bg-black text-white text-[10px] font-bold px-2 py-1 uppercase tracking-widest z-10">
                        Destacado
                      </div>
                    )}

                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                      <button className="w-full bg-white text-black font-bold uppercase text-xs py-3 tracking-widest hover:bg-stone-900 hover:text-white transition-colors">
                        Ver Producto
                      </button>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-base font-bold uppercase tracking-tight mb-1">
                      {product.name}
                    </h3>
                    <p className="text-stone-500 text-sm font-medium">
                      {formatPrice(product.price, product.currency)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-24 text-center">
            <h3 className="text-2xl font-bold uppercase mb-4">
              Sin resultados
            </h3>
            <button onClick={resetFilters} className="underline">
              Ver todo
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <StoreFooter
        store={store}
        config={{
          bg: "bg-black",
          text: "text-stone-400",
          border: "border-stone-800",
        }}
      />

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm top-[var(--store-navbar-offset)]"
              onClick={() => setMobileMenuOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div
              className="fixed inset-y-0 right-0 z-50 w-[85%] bg-white p-6 shadow-2xl flex flex-col top-[var(--store-navbar-offset)]"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30 }}
            >
              <div className="flex justify-between items-center mb-8">
                <span className="font-black text-xl uppercase">Menú</span>
                <button onClick={() => setMobileMenuOpen(false)}>
                  <X size={24} />
                </button>
              </div>
              <div className="space-y-6 flex-grow overflow-y-auto">
                {catalog.showSearch && (
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Buscar..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-stone-50 p-4 font-bold outline-none"
                    />
                    <Search
                      className="absolute right-4 top-1/2 -translate-y-1/2"
                      size={18}
                    />
                  </div>
                )}
              </div>
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-stone-400">
                  Filtros
                </h3>
                <CatalogFilters
                  categories={categories}
                  activeCategoryIds={activeCategoryIds}
                  onToggleCategory={(id) => {
                    toggleCategory(id);
                    // Optional: close menu on selection if desired, or let user filter multiple
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
                  showFeaturedOnly={showFeaturedOnly}
                  onToggleFeaturedOnly={toggleFeaturedOnly}
                  hasFeaturedProducts={hasFeaturedProducts}
                />
                <div className="pt-4 border-t border-stone-100">
                  <button
                    onClick={resetFilters}
                    className="w-full py-3 bg-stone-100 text-stone-900 font-bold uppercase text-xs tracking-widest hover:bg-stone-200"
                  >
                    Limpiar Todo
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
        tone="dark"
        showShareButton={catalog.showShareButton}
        showPaymentButton={catalog.showPaymentButton}
      />
    </div>
  );
}
