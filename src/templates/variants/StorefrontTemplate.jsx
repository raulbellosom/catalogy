import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, X, ExternalLink } from "lucide-react";
import { getStoreLogoUrl } from "@/shared/services/storeService";
import {
  ProductDetailModal,
  StoreNavbar,
  StoreFooter,
  CatalogFilters,
  ProductCard,
  StorePurchaseInfo,
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
  return map[fontId] || "'Roboto', sans-serif";
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

export function StorefrontTemplate({ store, products, isPreview = false }) {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  // ImageViewer
  const [viewer, setViewer] = useState({
    isOpen: false,
    images: [],
    index: 0,
  });

  const openViewer = (index, images, e) => {
    e.stopPropagation();
    setViewer({ isOpen: true, images, index });
  };

  return (
    <div
      className="min-h-screen flex flex-col bg-(--color-bg) text-slate-900 pt-[calc(var(--store-navbar-height)+var(--store-navbar-offset)+env(safe-area-inset-top))]"
      style={{
        fontFamily,
        colorScheme: "light",
        "--store-primary": primary,
        "--store-secondary": secondary,
        "--store-navbar-height": "4rem",
        "--store-navbar-offset": isPreview ? "2.5rem" : "0rem",
      }}
    >
      <StoreNavbar
        store={store}
        isPreview={isPreview}
        config={{
          bg: "bg-(--color-bg)/80",
          text: "text-slate-900",
          border: "border-slate-200/50",
          accent: "text-(--store-primary)",
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
            <a
              href={store.paymentLink}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center gap-2 text-sm font-medium text-(--store-primary) hover:text-slate-900 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Ir al pago
            </a>
          )
        }
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
              className="fixed inset-0 z-60 bg-black/50 backdrop-blur-sm md:hidden"
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
                className="absolute top-8 right-8 p-2 text-slate-500 hover:text-slate-900 border border-slate-200 rounded-full"
              >
                <X size={24} />
              </button>

              <div className="space-y-12">
                {(catalog.showSearch || catalog.showFilters) && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">
                        Búsqueda y Filtros
                      </h3>
                      <button
                        onClick={resetFilters}
                        className="text-[10px] font-bold uppercase tracking-widest text-(--store-primary)"
                      >
                        Reiniciar
                      </button>
                    </div>
                    {catalog.showSearch && (
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                          type="search"
                          value={searchQuery}
                          onChange={(event) =>
                            setSearchQuery(event.target.value)
                          }
                          placeholder="Buscar..."
                          className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400"
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
                  <div className="pt-8 border-t border-slate-100">
                    <a
                      href={store.paymentLink}
                      target="_blank"
                      className="w-full py-4 bg-(--store-primary) text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg whitespace-nowrap"
                    >
                      <ExternalLink size={20} /> Ir al pago
                    </a>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Hero / Banner Area */}
      <div className="bg-(--color-bg) border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 py-8 md:py-12 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1 space-y-4">
            <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 leading-tight">
              {store?.name}
            </h2>
            <p className="text-lg text-slate-600 max-w-xl">
              {store?.description || ""}
            </p>
            {store?.paymentLink && catalog.showPaymentButton && (
              <div className="pt-4">
                <a
                  href={store.paymentLink}
                  className="inline-flex justify-center items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-(--store-primary) hover:bg-slate-900 transition-colors shadow-lg"
                >
                  Ir al pago
                </a>
              </div>
            )}
          </div>
          {logoUrl && (
            <div className="flex-1 flex justify-center md:justify-end">
              <div className="w-full max-w-xs md:max-w-md aspect-square bg-slate-100 rounded-2xl flex items-center justify-center overflow-hidden shadow-xl">
                <img
                  src={logoUrl}
                  alt={store.name}
                  className="w-full h-full object-contain p-8"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Layout Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 w-full flex flex-col md:flex-row gap-8">
        {/* Sidebar Controls (Desktop) */}
        {catalog.showFilters && (
          <aside className="hidden md:block w-64 shrink-0 space-y-8">
            <div className="bg-(--color-bg) rounded-lg shadow-sm border border-slate-200/50 p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  Filtros
                </span>
                <button
                  onClick={resetFilters}
                  className="text-[10px] font-bold uppercase tracking-widest text-(--store-primary)"
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
          </aside>
        )}

        {/* Product Results */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900">Productos</h2>
            {catalog.showProductCount && (
              <span className="text-sm text-slate-500">
                {filteredProducts?.length || 0} resultados
              </span>
            )}
          </div>

          {filteredProducts && filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 md:gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id || product.$id}
                  product={product}
                  onCategoryClick={
                    catalog.showFilters ? (id) => toggleCategory(id) : undefined
                  }
                  onClick={() => setSelectedProduct(product)}
                  onImageClick={(index, images, e) =>
                    openViewer(index, images, e)
                  }
                  showShareButton={catalog.showShareButton}
                  showCategories={catalog.showFilters}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-slate-500 font-medium">
                No se encontraron productos
              </p>
              <button
                onClick={resetFilters}
                className="mt-4 text-(--store-primary) font-bold hover:underline"
              >
                Limpiar filtros
              </button>
            </div>
          )}
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
          bg: "bg-slate-900",
          text: "text-slate-400",
          border: "border-slate-800",
          muted: "text-slate-500",
          accent: "text-white",
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
        tone="storefront"
        showShareButton={catalog.showShareButton}
        showPaymentButton={catalog.showPaymentButton}
      />
    </div>
  );
}
