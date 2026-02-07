import { useState } from "react";
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
} from "../components";
import { ImageViewerModal } from "@/shared/ui/molecules/ImageViewerModal";
import { useCatalogFilters } from "../components/catalogHooks";
import { resolveThemeSettings } from "@/templates/registry";
import { resolveCatalogSettings } from "@/shared/utils/storeSettings";

// Internal helpers removed in favor of registry.resolveThemeSettings
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
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export function NatureTemplate({ store, products, isPreview = false }) {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Settings Resolution
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
  } = useCatalogFilters({ store, products });

  // ImageViewer State
  const [viewer, setViewer] = useState({
    isOpen: false,
    images: [],
    index: 0,
  });

  return (
    <div
      className="min-h-screen flex flex-col bg-(--color-bg) text-[#2d2a26] selection:bg-green-100 pt-[calc(var(--store-navbar-height)+var(--store-navbar-offset)+env(safe-area-inset-top))]"
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
        .animate-float { animation: float 6s ease-in-out infinite; }
        .organic-shape { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
      `}</style>

      <StoreNavbar
        store={store}
        isPreview={isPreview}
        config={{
          bg: "bg-(--color-bg)/80",
          text: "text-[#2d2a26]",
          border: "border-green-200/20",
          accent: "text-(--nature-primary)",
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
      />

      {/* Hero Section */}
      <header className="relative py-20 px-4 overflow-hidden">
        <div className="max-w-6xl mx-auto flex flex-col items-center text-center relative z-10">
          {/* Nature Icons Background */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.03] flex justify-between items-center px-10">
            <Trees className="w-64 h-64 text-green-900 -rotate-12" />
            <Cloud className="w-48 h-48 text-blue-900 translate-y-[-100px]" />
            <Wind className="w-40 h-40 text-green-900 rotate-12" />
          </div>

          {logoUrl ? (
            <div className="mb-8 p-1 bg-white organic-shape shadow-xl shadow-green-900/5 overflow-hidden w-24 h-24 md:w-32 md:h-32 flex items-center justify-center">
              <img
                src={logoUrl}
                alt={store.name}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="mb-8 p-6 bg-green-50 text-(--nature-primary) organic-shape animate-float">
              <Leaf size={48} />
            </div>
          )}

          <h1 className="text-4xl md:text-6xl font-serif font-bold text-[#1a2e1a] mb-6 leading-tight">
            {store.name}
          </h1>

          {store.description && (
            <p className="text-lg md:text-xl text-[#4a554a] max-w-2xl mx-auto font-light leading-relaxed">
              {store.description}
            </p>
          )}

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <a
              href="#catalog"
              className="px-8 py-3 bg-(--nature-primary) text-white rounded-full font-medium shadow-lg shadow-green-900/20 hover:scale-105 transition-all flex items-center gap-2"
            >
              Explorar Catálogo <ArrowRight size={18} />
            </a>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-green-100 organic-shape opacity-40 blur-3xl -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-orange-100 organic-shape opacity-30 blur-3xl -ml-20 -mb-20" />
      </header>

      {/* Main Content */}
      <main
        id="catalog"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full"
      >
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar / Filters - Hidden on Mobile */}
          {catalog.showFilters && (
            <div className="hidden lg:block lg:w-72 shrink-0">
              <div className="sticky top-24 space-y-8">
                <div className="bg-white/50 backdrop-blur-sm border border-green-50 rounded-3xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-green-800/60 flex items-center gap-2">
                      <Filter size={14} /> Filtros
                    </h3>
                    <button
                      onClick={resetFilters}
                      className="text-[10px] font-bold uppercase tracking-widest text-(--nature-primary)"
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
                  />
                </div>
              </div>
            </div>
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
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6 md:gap-8">
                {filteredProducts.map((product) => {
                  const imageId = product.imageFileIds?.[0];
                  const imageUrl = imageId ? getProductImageUrl(imageId) : null;

                  return (
                    <div
                      key={product.$id}
                      onClick={() => setSelectedProduct(product)}
                      className="group cursor-pointer bg-white rounded-4xl overflow-hidden border border-green-50/50 shadow-sm hover:shadow-xl hover:shadow-green-900/5 transition-all duration-500"
                    >
                      <div className="aspect-4/5 overflow-hidden relative">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-50">
                            <Flower2 className="w-12 h-12 text-green-100" />
                          </div>
                        )}

                        {catalog.showShareButton && (
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              shareProduct(product);
                            }}
                            className="absolute right-3 top-3 h-9 w-9 rounded-full bg-white/90 text-[#1a2e1a] flex items-center justify-center shadow-sm hover:shadow-md transition-shadow"
                            aria-label="Compartir producto"
                          >
                            <Share2 size={16} />
                          </button>
                        )}

                        {/* Price Tag Overlay */}
                        <div className="absolute bottom-4 left-4">
                          <span className="bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-sm font-bold text-(--nature-primary) shadow-sm">
                            {formatPrice(product.price, product.currency)}
                          </span>
                        </div>

                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-green-900/0 group-hover:bg-green-900/10 transition-colors duration-500" />
                      </div>

                      <div className="p-6">
                        <h3 className="font-serif text-lg font-bold text-[#1a2e1a] mb-1 group-hover:text-(--nature-primary) transition-colors">
                          {product.name}
                        </h3>
                        {catalog.showFilters &&
                          product.categories &&
                          product.categories.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3">
                              {product.categories.map((cat) => (
                                <button
                                  key={cat.id}
                                  type="button"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    toggleCategory(cat.id);
                                  }}
                                  className="text-[9px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-green-50 text-[#1a2e1a] hover:bg-(--nature-primary) hover:text-white transition-colors"
                                >
                                  {cat.name}
                                </button>
                              ))}
                            </div>
                          )}
                        {product.description && (
                          <p className="text-sm text-[#5d6b5d] line-clamp-1 italic mb-4">
                            {product.description}
                          </p>
                        )}
                        <div className="flex items-center text-(--nature-primary) text-xs font-bold uppercase tracking-widest gap-1 group-hover:gap-2 transition-all">
                          Ver detalles <ChevronRight size={14} />
                        </div>
                      </div>
                    </div>
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
                  onClick={() => setSearchQuery("")}
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 w-full">
          <StorePurchaseInfo
            store={store}
            showPaymentButton={catalog.showPaymentButton}
          />
        </div>
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
      />
    </div>
  );
}
