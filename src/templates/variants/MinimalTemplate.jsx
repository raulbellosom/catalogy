import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, ShoppingBag, X, Filter, Share2 } from "lucide-react";
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
  return map[fontId] || "'Inter', sans-serif";
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

export function MinimalTemplate({ store, products, isPreview = false }) {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const catalog = resolveCatalogSettings(store);
  const [showFilters, setShowFilters] = useState(catalog.showFilters);

  // Settings Resolution
  const theme = resolveThemeSettings(store);
  const fontFamily = resolveFontFamily(theme.font);
  const primary = theme.colors.primary;

  // Featured Products
  const featuredProductIds = catalog.featuredProductIds || [];
  const featuredProducts =
    products?.filter((p) => featuredProductIds.includes(p.id || p.$id)) || [];
  const secondary = theme.colors.secondary;
  const logoUrl = store?.logoFileId ? getStoreLogoUrl(store.logoFileId) : null;

  useEffect(() => {
    setShowFilters(catalog.showFilters);
  }, [catalog.showFilters]);

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

  const showMobileFilters = catalog.showSearch || catalog.showFilters;

  // ImageViewer State
  const [viewer, setViewer] = useState({
    isOpen: false,
    images: [],
    index: 0,
  });

  const openViewer = (index, images) => {
    setViewer({ isOpen: true, images, index });
  };

  return (
    <div
      className="min-h-screen flex flex-col bg-(--color-bg) text-gray-900 pt-[calc(var(--store-navbar-height)+var(--store-navbar-offset)+env(safe-area-inset-top))]"
      style={{
        fontFamily,
        colorScheme: "light",
        "--minimal-accent": primary,
        "--minimal-secondary": secondary,
        "--store-navbar-height": "4rem",
        "--store-navbar-offset": isPreview ? "2.5rem" : "0rem",
      }}
    >
      <StoreNavbar
        store={store}
        isPreview={isPreview}
        config={{
          bg: "bg-(--color-bg)/80",
          text: "text-gray-900",
          border: "border-gray-900/5",
          accent: "text-(--minimal-accent)",
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
          store?.paymentLink &&
          catalog.showPaymentButton && (
            <div className="hidden md:flex items-center gap-6">
              <a
                href={store.paymentLink}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-2 bg-black text-white rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
                style={{ backgroundColor: primary }}
              >
                Ir al pago
              </a>
            </div>
          )
        }
      />

      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-60 bg-black/10 backdrop-blur-[2px] md:hidden"
            />

            {/* Menu Sidebar */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 z-60 w-[85%] bg-white p-6 pt-24 shadow-2xl overflow-y-auto md:hidden"
            >
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="absolute top-8 right-8 p-2 text-gray-600 hover:text-black border border-gray-100 rounded-full shadow-sm"
              >
                <X size={24} />
              </button>

              <div className="space-y-12">
                {showMobileFilters && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">
                        Búsqueda y Filtros
                      </h3>
                      <button
                        onClick={resetFilters}
                        className="text-[10px] font-bold uppercase tracking-widest text-(--minimal-accent)"
                      >
                        Reiniciar
                      </button>
                    </div>
                    {catalog.showSearch && (
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="search"
                          value={searchQuery}
                          onChange={(event) =>
                            setSearchQuery(event.target.value)
                          }
                          placeholder="Buscar..."
                          className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none border border-gray-200 bg-gray-50 text-gray-900 placeholder:text-gray-400"
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
                  <div className="pt-8 border-t border-gray-100">
                    <a
                      href={store.paymentLink}
                      target="_blank"
                      className="w-full py-4 px-4 bg-black text-white rounded-full font-bold flex items-center justify-center shadow-lg whitespace-nowrap"
                      style={{ backgroundColor: primary }}
                    >
                      Ir al pago
                    </a>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Hero Section: Simple & Text-based */}
      <header className="relative bg-(--color-bg) py-16 md:py-24 border-b border-gray-900/5 overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6 relative z-10">
          {logoUrl && (
            <div className="flex justify-center mb-6">
              <img
                src={logoUrl}
                alt={store.name}
                className="h-16 md:h-24 w-auto object-contain"
              />
            </div>
          )}
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900 leading-tight">
            {store?.name}
          </h1>
          {store?.description && (
            <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
              {store.description}
            </p>
          )}
        </div>

        {/* Abstract Background Element */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-(--minimal-accent) rounded-full opacity-[0.03] blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-72 h-72 bg-(--minimal-secondary) rounded-full opacity-[0.03] blur-3xl pointer-events-none"></div>
      </header>

      {/* Featured Section */}
      {featuredProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-b border-gray-900/5">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-px bg-gray-200 flex-1" />
            <h2 className="text-sm font-bold uppercase tracking-widest text-(--minimal-accent)">
              Destacados
            </h2>
            <div className="h-px bg-gray-200 flex-1" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-8 md:gap-x-8">
            {featuredProducts.map((product) => {
              const imageId = product.imageFileIds?.[0];
              const imageUrl = imageId ? getProductImageUrl(imageId) : null;
              return (
                <div
                  key={product.id || product.$id}
                  onClick={() => setSelectedProduct(product)}
                  className="group cursor-pointer flex flex-col gap-4"
                >
                  <div className="relative aspect-4/5 bg-gray-50 overflow-hidden rounded-sm hover-trigger">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <ShoppingBag className="w-8 h-8 opacity-20" />
                      </div>
                    )}
                    <div className="absolute top-2 left-2">
                      <span className="bg-(--minimal-accent) text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wider">
                        Star
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1 text-center">
                    <h3 className="font-medium text-gray-900 group-hover:text-(--minimal-accent) transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-sm font-medium text-gray-500">
                      {formatPrice(product.price, product.currency)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Main Content */}
      <main className="grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        {(catalog.showProductCount || catalog.showFilters) && (
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 border-b border-gray-900/5 pb-4">
            {catalog.showProductCount && (
              <div>
                <span className="text-sm text-gray-500 font-medium">
                  Mostrando {filteredProducts?.length || 0} productos
                </span>
              </div>
            )}

            {catalog.showFilters && (
              <div className="hidden md:flex items-center gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`group flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-full transition-all border ${
                    showFilters
                      ? "bg-gray-900 text-white border-gray-900"
                      : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
                  }`}
                  style={
                    showFilters
                      ? { backgroundColor: primary, borderColor: primary }
                      : {}
                  }
                >
                  <Filter className="w-4 h-4" />
                  {showFilters ? "Ocultar Filtros" : "Mostrar Filtros"}
                </button>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar Filters */}
          {catalog.showFilters && (
            <aside
              className={`hidden lg:block lg:w-72 space-y-12 transition-all duration-300 ease-in-out ${
                showFilters ? "opacity-100" : "opacity-0"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
                  Filtros
                </span>
                <button
                  onClick={resetFilters}
                  className="text-[10px] font-bold uppercase tracking-widest text-(--minimal-accent)"
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
            </aside>
          )}

          {/* Product Grid */}
          <div className="flex-1">
            {filteredProducts && filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-x-4 gap-y-8 md:gap-x-8 md:gap-y-12">
                {filteredProducts.map((product) => {
                  // Get first valid image
                  const imageId = product.imageFileIds?.[0];
                  const imageUrl = imageId ? getProductImageUrl(imageId) : null;

                  return (
                    <div
                      key={product.id || product.$id}
                      onClick={() => setSelectedProduct(product)}
                      className="group cursor-pointer flex flex-col gap-4"
                    >
                      {/* Image Aspect */}
                      <div className="relative aspect-4/5 bg-gray-50 overflow-hidden rounded-sm hover-trigger">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <ShoppingBag className="w-8 h-8 opacity-20" />
                          </div>
                        )}

                        {catalog.showShareButton && (
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              shareProduct(product);
                            }}
                            className="absolute right-3 top-3 h-8 w-8 rounded-full bg-white/90 text-gray-700 flex items-center justify-center shadow-sm hover:shadow-md transition-shadow"
                            aria-label="Compartir producto"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>
                        )}

                        {/* Overlay Action */}
                        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="bg-white text-black text-xs font-bold px-4 py-2 rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform">
                            Ver detalles
                          </span>
                        </div>
                      </div>

                      {/* Info */}
                      <div className="space-y-1">
                        <h3 className="font-medium text-gray-900 group-hover:text-(--minimal-accent) transition-colors">
                          {product.name}
                        </h3>
                        {catalog.showFilters &&
                          product.categories &&
                          product.categories.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {product.categories.map((cat) => (
                                <button
                                  key={cat.id}
                                  type="button"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    toggleCategory(cat.id);
                                  }}
                                  className="text-[9px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 hover:bg-(--minimal-accent) hover:text-white transition-colors"
                                >
                                  {cat.name}
                                </button>
                              ))}
                            </div>
                          )}
                        <p className="text-sm font-medium text-gray-500">
                          {formatPrice(product.price, product.currency)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                  <Search className="w-6 h-6 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">
                  No encontramos resultados
                </h3>
                <p className="text-gray-500">
                  Intenta ajustar los filtros o tu búsqueda.
                </p>
                <button
                  onClick={resetFilters}
                  className="mt-6 text-sm font-bold text-(--minimal-accent) hover:underline"
                >
                  Borrar filtros
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
          wrapperClassName="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 w-full"
        />
      )}
      <StoreFooter
        store={store}
        config={{
          bg: "bg-gray-50",
          text: "text-gray-500",
          border: "border-gray-100",
          muted: "text-gray-400",
          accent: "text-black",
        }}
      />

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
      />
    </div>
  );
}
