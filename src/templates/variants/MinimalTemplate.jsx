import { useState } from "react";
import {
  Search,
  ShoppingBag,
  Menu,
  X,
  ChevronDown,
  Facebook,
  Instagram,
  Twitter,
  ExternalLink,
  Filter,
  ArrowRight,
  Check,
} from "lucide-react";
import { getStoreLogoUrl } from "@/shared/services/storeService";
import { getProductImageUrl } from "@/shared/services/productService";
import {
  ProductDetailModal,
  StoreNavbar,
  StoreFooter,
  CatalogFilters,
} from "../components";
import { ImageViewerModal } from "@/shared/ui/molecules/ImageViewerModal";
import { useCatalogFilters, useProductShare } from "../components/catalogHooks";
import { Logo } from "@/shared/ui/atoms/Logo";
import { appConfig } from "@/shared/lib/env";
import { resolveThemeSettings } from "@/templates/registry";

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
  const [showFilters, setShowFilters] = useState(true); // Default open on desktop

  // Settings Resolution
  const theme = resolveThemeSettings(store);
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
  } = useCatalogFilters({ store, products });

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
      className={`min-h-screen flex flex-col bg-(--color-bg) text-gray-900 ${isPreview ? "pt-32" : "pt-20"}`}
      style={{
        fontFamily,
        "--minimal-accent": primary,
        "--minimal-secondary": secondary,
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
        search={{
          query: searchQuery,
          onQueryChange: setSearchQuery,
        }}
        onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
        actions={
          store?.paymentLink && (
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

      {/* Mobile Menu Overlay for Minimal Template */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-white p-4 pt-20 animate-in slide-in-from-top-5">
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="absolute top-4 right-4 p-2 text-gray-600 hover:text-black"
          >
            <X size={24} />
          </button>
          <div className="relative w-full mb-4">
            <input
              type="text"
              placeholder="Buscar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 border-none rounded-full py-2.5 pl-4 pr-10 text-sm focus:ring-1 focus:ring-black"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
          {store?.paymentLink && (
            <a
              href={store.paymentLink}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center w-full py-3 bg-(--minimal-accent) text-white rounded-lg font-medium"
            >
              Ir al pago
            </a>
          )}
        </div>
      )}

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
            {store?.description ? (
              <span className="block">{store.name}</span>
            ) : (
              "Bienvenido a nuestra colección"
            )}
          </h1>
          {store?.description && (
            <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
              {store.description}
            </p>
          )}

          {/* Purchase Instructions Pill */}
          {store?.purchaseInstructions && (
            <div className="mt-8 inline-block bg-gray-50 border border-gray-100 rounded-2xl p-6 max-w-lg mx-auto text-left">
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
                Información de Compra
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                {store.purchaseInstructions}
              </p>
            </div>
          )}
        </div>

        {/* Abstract Background Element */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-(--minimal-accent) rounded-full opacity-[0.03] blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-72 h-72 bg-(--minimal-secondary) rounded-full opacity-[0.03] blur-3xl pointer-events-none"></div>
      </header>

      {/* Main Content */}
      <main className="grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        {/* Filter Toggle / Sort Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 border-b border-gray-900/5 pb-4">
          <div>
            <span className="text-sm text-gray-500 font-medium">
              Mostrando {filteredProducts?.length || 0} productos
            </span>
          </div>

          <div className="flex items-center gap-2">
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
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar Filters */}
          <aside
            className={`lg:w-72 space-y-12 transition-all duration-300 ease-in-out ${
              showFilters ? "block opacity-100" : "hidden opacity-0"
            }`}
          >
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
            />
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            {filteredProducts && filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-8 md:gap-x-8 md:gap-y-12">
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
                  onClick={() => {
                    setSearchQuery("");
                    // Reset filters logic if available via props
                  }}
                  className="mt-6 text-sm font-bold text-(--minimal-accent) hover:underline"
                >
                  Borrar filtros
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

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
      />
    </div>
  );
}
